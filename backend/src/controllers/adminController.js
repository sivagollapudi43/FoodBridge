import User from '../models/User.js';
import Donation from '../models/Donation.js';

/**
 * @desc    Get admin overview statistics, users, and food listings
 * @route   GET /api/admin/overview
 * @access  Private (Admin Only)
 */
export const getAdminOverview = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const regularUsers = await User.countDocuments({ role: 'user' });
    const adminUsers = await User.countDocuments({ role: 'admin' });

    const totalFoodListings = await Donation.countDocuments();
    const availableFood = await Donation.countDocuments({ status: 'Available' });
    const claimedFood = await Donation.countDocuments({ status: 'Claimed' });

    const recentFood = await Donation.find()
      .populate('user', 'name email phone')
      .populate('claimedBy', 'name phone')
      .sort({ createdAt: -1 })
      .limit(30);

    const users = await User.find().sort({ createdAt: -1 }).limit(50);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        regularUsers,
        adminUsers,
        totalFoodListings,
        availableFood,
        claimedFood,
      },
      recentFood,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch admin overview',
    });
  }
};

/**
 * @desc    Delete a user (Admin only)
 * @route   DELETE /api/admin/users/:id
 * @access  Private (Admin Only)
 */
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.email === 'sivagollapudi43@gmail.com') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete the primary administrator account',
      });
    }

    // Also delete food posted by this user
    await Donation.deleteMany({ user: user._id });
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: `User ${user.name} and their listings deleted successfully`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete user',
    });
  }
};
