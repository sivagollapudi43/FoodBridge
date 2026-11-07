import User from '../models/User.js';
import Organization from '../models/Organization.js';
import Donation from '../models/Donation.js';
import Delivery from '../models/Delivery.js';
import AuditLog from '../models/AuditLog.js';
import Report from '../models/Report.js';
import { logAudit } from '../utils/logger.js';
import { createAndSendNotification } from '../sockets/socketHandler.js';

/**
 * @desc    Get system-wide analytics & stats for Admin Dashboard
 * @route   GET /api/admin/analytics
 * @access  Private (Admin)
 */
export const getAdminAnalytics = async (req, res) => {
  try {
    // 1. User counts
    const totalUsers = await User.countDocuments();
    const totalDonors = await User.countDocuments({ role: 'donor' });
    const totalNGOs = await User.countDocuments({ role: 'ngo' });
    const verifiedNGOs = await User.countDocuments({ role: 'ngo', isVerified: true });
    const pendingNGOs = await User.countDocuments({ role: 'ngo', isVerified: false });
    const totalVolunteers = await User.countDocuments({ role: 'volunteer' });

    // 2. Donation breakdown
    const totalDonations = await Donation.countDocuments();
    const availableDonations = await Donation.countDocuments({ status: 'Available' });
    const activeDonations = await Donation.countDocuments({
      status: { $in: ['Requested', 'Accepted', 'Assigned', 'Collected'] },
    });
    const completedDonations = await Donation.countDocuments({ status: 'Delivered' });
    const expiredDonations = await Donation.countDocuments({ status: 'Expired' });

    // 3. Real Redistribution Metrics (clearly distinguished)
    const deliveredDonations = await Donation.find({ status: 'Delivered' }).lean();

    let totalWeightKgRedistributed = 0;
    let totalEstimatedMealsServed = 0;

    deliveredDonations.forEach((d) => {
      totalEstimatedMealsServed += d.estimatedMeals || 0;
      if (d.unit === 'kg') {
        totalWeightKgRedistributed += d.quantity;
      } else if (d.unit === 'portions') {
        totalWeightKgRedistributed += parseFloat((d.quantity * 0.4).toFixed(1)); // ~400g per portion
      } else if (d.unit === 'boxes' || d.unit === 'crates') {
        totalWeightKgRedistributed += d.quantity * 5;
      } else {
        totalWeightKgRedistributed += d.quantity;
      }
    });

    // 4. Category breakdown
    const categoryAggregation = await Donation.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // 5. Recent 7-day trend
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyTrend = await Donation.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          donations: { $sum: 1 },
          meals: { $sum: '$estimatedMeals' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          donors: totalDonors,
          ngos: totalNGOs,
          verifiedNGOs,
          pendingNGOs,
          volunteers: totalVolunteers,
        },
        donations: {
          total: totalDonations,
          available: availableDonations,
          active: activeDonations,
          completed: completedDonations,
          expired: expiredDonations,
        },
        impact: {
          totalWeightKgRedistributed: Math.round(totalWeightKgRedistributed),
          totalEstimatedMealsServed,
          co2EmissionsPreventedKg: Math.round(totalWeightKgRedistributed * 2.5), // 1 kg food waste ~ 2.5 kg CO2
        },
        categoryBreakdown: categoryAggregation,
        dailyTrend,
      },
    });
  } catch (error) {
    console.error('[Admin Analytics Error]', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch admin analytics',
    });
  }
};

/**
 * @desc    Get all users (with filters)
 * @route   GET /api/admin/users
 * @access  Private (Admin)
 */
export const getAllUsers = async (req, res) => {
  try {
    const { role, status, isVerified, search } = req.query;
    const filter = {};

    if (role && role !== 'all') filter.role = role;
    if (status && status !== 'all') filter.status = status;
    if (isVerified !== undefined) filter.isVerified = isVerified === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter)
      .populate('organization')
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch users',
    });
  }
};

/**
 * @desc    Verify or Reject NGO organization registration
 * @route   PUT /api/admin/verify-ngo/:id
 * @access  Private (Admin)
 */
export const verifyNgo = async (req, res) => {
  try {
    const { action, notes } = req.body; // action: 'approve' or 'reject'
    const user = await User.findById(req.params.id).populate('organization');

    if (!user || user.role !== 'ngo') {
      return res.status(404).json({ success: false, message: 'NGO user not found' });
    }

    const isApprove = action === 'approve';
    user.isVerified = isApprove;
    user.status = isApprove ? 'active' : 'pending';
    await user.save();

    if (user.organization) {
      await Organization.findByIdAndUpdate(user.organization._id, {
        verificationStatus: isApprove ? 'verified' : 'rejected',
        verifiedAt: isApprove ? new Date() : null,
        verifiedBy: req.user._id,
      });
    }

    // Audit log
    await logAudit({
      userId: req.user._id,
      action: isApprove ? 'NGO_VERIFIED' : 'NGO_REJECTED',
      resourceType: 'user',
      resourceId: user._id,
      details: { ngoName: user.name, notes },
      req,
    });

    // Notify NGO
    await createAndSendNotification({
      recipient: user._id,
      sender: req.user._id,
      type: 'account_verified',
      title: isApprove ? 'Organization Verified! 🎉' : 'Verification Update',
      message: isApprove
        ? 'Congratulations! Your NGO organization has been officially verified. You can now claim food donations.'
        : `Your verification request could not be approved at this time. Reason: ${notes || 'Documentation incomplete'}`,
      link: `/dashboard/ngo`,
    });

    res.status(200).json({
      success: true,
      message: `NGO registration ${isApprove ? 'approved & verified' : 'rejected'}.`,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update NGO verification',
    });
  }
};

/**
 * @desc    Suspend or activate user account
 * @route   PUT /api/admin/users/:id/status
 * @access  Private (Admin)
 */
export const updateUserStatus = async (req, res) => {
  try {
    const { status, reason } = req.body; // status: 'active', 'suspended'
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot suspend administrator accounts' });
    }

    user.status = status;
    await user.save();

    await logAudit({
      userId: req.user._id,
      action: status === 'suspended' ? 'USER_SUSPENDED' : 'USER_ACTIVATED',
      resourceType: 'user',
      resourceId: user._id,
      details: { targetEmail: user.email, reason },
      req,
    });

    res.status(200).json({
      success: true,
      message: `User status changed to ${status}`,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update user status',
    });
  }
};

/**
 * @desc    Get audit logs
 * @route   GET /api/admin/audit-logs
 * @access  Private (Admin)
 */
export const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      logs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch audit logs',
    });
  }
};

