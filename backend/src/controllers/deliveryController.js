import Delivery from '../models/Delivery.js';
import Donation from '../models/Donation.js';
import VolunteerAssignment from '../models/VolunteerAssignment.js';
import User from '../models/User.js';
import { logAudit } from '../utils/logger.js';
import { createAndSendNotification } from '../sockets/socketHandler.js';

/**
 * @desc    Assign a volunteer to a delivery (NGO)
 * @route   POST /api/deliveries/:id/assign-volunteer
 * @access  Private (NGO, Admin)
 */
export const assignVolunteer = async (req, res) => {
  try {
    const { volunteerId, instructions } = req.body;
    const delivery = await Delivery.findById(req.params.id)
      .populate('donation')
      .populate('request');

    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery record not found' });
    }

    if (delivery.ngo.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized for this delivery' });
    }

    const volunteer = await User.findOne({ _id: volunteerId, role: 'volunteer', status: 'active' });
    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Active volunteer not found' });
    }

    // Create assignment
    const assignment = await VolunteerAssignment.create({
      donation: delivery.donation._id,
      request: delivery.request._id,
      volunteer: volunteer._id,
      assignedBy: req.user._id,
      instructions: instructions || 'Please collect food within pickup window.',
      status: 'assigned',
    });

    delivery.assignment = assignment._id;
    delivery.volunteer = volunteer._id;
    await delivery.save();

    // Update donation status to 'Assigned'
    await Donation.findByIdAndUpdate(delivery.donation._id, {
      status: 'Assigned',
      $push: {
        statusHistory: {
          status: 'Assigned',
          changedBy: req.user._id,
          timestamp: new Date(),
          note: `Volunteer ${volunteer.name} assigned`,
        },
      },
    });

    // Notify volunteer in real-time
    await createAndSendNotification({
      recipient: volunteer._id,
      sender: req.user._id,
      type: 'volunteer_assigned',
      title: 'New Food Rescue Mission Assigned! 🛵',
      message: `You have been assigned to pick up "${delivery.donation.title}" from ${delivery.pickupLocation.city}.`,
      link: `/dashboard/volunteer`,
      data: { deliveryId: delivery._id, assignmentId: assignment._id },
    });

    res.status(200).json({
      success: true,
      message: `Volunteer ${volunteer.name} assigned successfully!`,
      delivery,
      assignment,
    });
  } catch (error) {
    console.error('[Assign Volunteer Error]', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while assigning volunteer',
    });
  }
};

/**
 * @desc    Get deliveries assigned to the logged-in Volunteer
 * @route   GET /api/deliveries/my-deliveries
 * @access  Private (Volunteer)
 */
export const getMyDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.find({ volunteer: req.user._id })
      .populate('donation')
      .populate('donor', 'name phone email avatar address')
      .populate('ngo', 'name phone email avatar address')
      .populate('assignment')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: deliveries.length,
      deliveries,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch volunteer deliveries',
    });
  }
};

/**
 * @desc    Get NGO deliveries
 * @route   GET /api/deliveries/ngo-deliveries
 * @access  Private (NGO)
 */
export const getNgoDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.find({ ngo: req.user._id })
      .populate('donation')
      .populate('volunteer', 'name phone email volunteerProfile')
      .populate('donor', 'name phone email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: deliveries.length,
      deliveries,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch NGO deliveries',
    });
  }
};

/**
 * @desc    Volunteer accepts or declines assignment
 * @route   PUT /api/deliveries/:id/respond-assignment
 * @access  Private (Volunteer)
 */
export const respondAssignment = async (req, res) => {
  try {
    const { action, declineReason } = req.body; // action: 'accept' or 'decline'
    const delivery = await Delivery.findById(req.params.id).populate('donation');

    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }

    if (delivery.volunteer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized for this task' });
    }

    if (action === 'accept') {
      delivery.status = 'en_route_pickup';
      await delivery.save();

      await VolunteerAssignment.findByIdAndUpdate(delivery.assignment, {
        status: 'accepted',
        respondedAt: new Date(),
      });

      // Notify NGO
      await createAndSendNotification({
        recipient: delivery.ngo,
        sender: req.user._id,
        type: 'system',
        title: 'Volunteer Accepted Mission',
        message: `${req.user.name} accepted the mission and is en route to collect "${delivery.donation.title}".`,
        link: `/dashboard/ngo`,
      });

      return res.status(200).json({
        success: true,
        message: 'Mission accepted! Please proceed to pickup point.',
        delivery,
      });
    } else {
      // Decline
      await VolunteerAssignment.findByIdAndUpdate(delivery.assignment, {
        status: 'declined',
        declineReason: declineReason || 'Unavailable',
        respondedAt: new Date(),
      });

      // Revert delivery status
      delivery.status = 'scheduled';
      delivery.volunteer = delivery.ngo; // revert to NGO
      delivery.assignment = null;
      await delivery.save();

      await Donation.findByIdAndUpdate(delivery.donation._id, { status: 'Accepted' });

      // Notify NGO to reassign
      await createAndSendNotification({
        recipient: delivery.ngo,
        sender: req.user._id,
        type: 'system',
        title: 'Volunteer Declined Mission',
        message: `${req.user.name} declined pickup for "${delivery.donation.title}". Please reassign.`,
        link: `/dashboard/ngo`,
      });

      return res.status(200).json({
        success: true,
        message: 'Assignment declined.',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to respond to assignment',
    });
  }
};

/**
 * @desc    Verify food collection (Handshake between Donor & Volunteer via Code/QR)
 * @route   PUT /api/deliveries/:id/verify-pickup
 * @access  Private (Volunteer, NGO, Donor)
 */
export const verifyPickup = async (req, res) => {
  try {
    const { code, proofImage, notes } = req.body;
    const delivery = await Delivery.findById(req.params.id).populate('donation');

    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }

    // Verify code match
    if (code.trim() !== delivery.pickupVerificationCode.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pickup verification code. Please confirm code with the donor.',
      });
    }

    delivery.isPickupVerified = true;
    delivery.status = 'collected';
    delivery.pickupTimestamp = new Date();
    if (proofImage) delivery.pickupProofImage = proofImage;
    if (notes) delivery.notes = notes;
    await delivery.save();

    // Update Donation status
    await Donation.findByIdAndUpdate(delivery.donation._id, {
      status: 'Collected',
      $push: {
        statusHistory: {
          status: 'Collected',
          changedBy: req.user._id,
          timestamp: new Date(),
          note: `Food safely collected by ${req.user.name}`,
        },
      },
    });

    // Notify Donor and NGO
    await createAndSendNotification({
      recipient: delivery.donor,
      sender: req.user._id,
      type: 'food_collected',
      title: 'Food Donation Picked Up! 📦',
      message: `Your donation "${delivery.donation.title}" has been successfully verified and picked up!`,
      link: `/dashboard/donor`,
    });

    await createAndSendNotification({
      recipient: delivery.ngo,
      sender: req.user._id,
      type: 'food_collected',
      title: 'Food In Transit 🚚',
      message: `Donation "${delivery.donation.title}" has been collected and is en route to your dropoff location.`,
      link: `/dashboard/ngo`,
    });

    res.status(200).json({
      success: true,
      message: 'Pickup verified successfully! Food is marked as Collected.',
      delivery,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify pickup',
    });
  }
};

/**
 * @desc    Verify food delivery (Handshake between Volunteer & NGO via Code/QR)
 * @route   PUT /api/deliveries/:id/verify-delivery
 * @access  Private (Volunteer, NGO)
 */
export const verifyDelivery = async (req, res) => {
  try {
    const { code, proofImage, notes } = req.body;
    const delivery = await Delivery.findById(req.params.id).populate('donation');

    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }

    if (!delivery.isPickupVerified) {
      return res.status(400).json({
        success: false,
        message: 'Cannot mark as delivered before pickup is verified.',
      });
    }

    // Verify code match
    if (code.trim() !== delivery.deliveryVerificationCode.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid delivery verification code. Please confirm code with NGO staff.',
      });
    }

    delivery.isDeliveryVerified = true;
    delivery.status = 'delivered';
    delivery.deliveryTimestamp = new Date();
    if (proofImage) delivery.deliveryProofImage = proofImage;
    if (notes) delivery.notes += ` | ${notes}`;
    await delivery.save();

    // Update volunteer profile completedDeliveries
    if (delivery.volunteer) {
      await User.findByIdAndUpdate(delivery.volunteer, {
        $inc: { 'volunteerProfile.completedDeliveries': 1 },
      });
    }

    // Mark Donation as Delivered
    await Donation.findByIdAndUpdate(delivery.donation._id, {
      status: 'Delivered',
      $push: {
        statusHistory: {
          status: 'Delivered',
          changedBy: req.user._id,
          timestamp: new Date(),
          note: `Food safely delivered to community shelter. Mission completed!`,
        },
      },
    });

    // Notify Donor and NGO
    await createAndSendNotification({
      recipient: delivery.donor,
      sender: req.user._id,
      type: 'food_delivered',
      title: 'Donation Delivered & Meals Served! ❤️',
      message: `Your food donation "${delivery.donation.title}" has reached the shelter and is feeding hungry families!`,
      link: `/dashboard/donor`,
    });

    await createAndSendNotification({
      recipient: delivery.ngo,
      sender: req.user._id,
      type: 'food_delivered',
      title: 'Delivery Handover Complete! 🎉',
      message: `Donation "${delivery.donation.title}" has been successfully delivered and logged.`,
      link: `/dashboard/ngo`,
    });

    res.status(200).json({
      success: true,
      message: 'Delivery verified successfully! Meals saved and recorded.',
      delivery,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify delivery',
    });
  }
};

/**
 * @desc    Get list of available active volunteers for assignment
 * @route   GET /api/deliveries/available-volunteers
 * @access  Private (NGO, Admin)
 */
export const getAvailableVolunteers = async (req, res) => {
  try {
    const volunteers = await User.find({
      role: 'volunteer',
      status: 'active',
      'volunteerProfile.isAvailable': true,
    }).select('name email phone location volunteerProfile');

    res.status(200).json({
      success: true,
      volunteers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch available volunteers',
    });
  }
};

