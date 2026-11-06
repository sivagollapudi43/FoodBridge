import mongoose from 'mongoose';
import Donation from '../models/Donation.js';
import DonationRequest from '../models/DonationRequest.js';
import Delivery from '../models/Delivery.js';
import { logAudit } from '../utils/logger.js';
import { createAndSendNotification } from '../sockets/socketHandler.js';

/**
 * @desc    Submit a donation claim request (NGO)
 * @route   POST /api/requests
 * @access  Private (NGO)
 */
export const createRequest = async (req, res) => {
  try {
    const { donationId, message, estimatedBeneficiaries, transportMethod, requestedPickupTime } =
      req.body;

    if (!donationId || !message || !estimatedBeneficiaries) {
      return res.status(400).json({
        success: false,
        message: 'Please provide donation ID, message, and estimated beneficiaries.',
      });
    }

    // Require NGO to be verified
    if (!req.user.isVerified) {
      return res.status(403).json({
        success: false,
        message:
          'Your NGO registration is still pending verification by administrators. Only verified NGOs can claim donations.',
      });
    }

    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    if (!['Available', 'Requested'].includes(donation.status)) {
      return res.status(400).json({
        success: false,
        message: `This donation is no longer available. Current status: ${donation.status}`,
      });
    }

    if (new Date(donation.collectionDeadline) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'This donation has passed its collection deadline and has expired.',
      });
    }

    // Check if this NGO has already requested this donation
    const existingRequest = await DonationRequest.findOne({
      donation: donationId,
      ngo: req.user._id,
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a request for this donation.',
      });
    }

    const request = await DonationRequest.create({
      donation: donationId,
      ngo: req.user._id,
      organization: req.user.organization?._id || null,
      message,
      estimatedBeneficiaries: Number(estimatedBeneficiaries),
      transportMethod: transportMethod || 'Volunteer Courier',
      requestedPickupTime: requestedPickupTime ? new Date(requestedPickupTime) : new Date(Date.now() + 2 * 3600 * 1000),
      status: 'pending',
    });

    // Mark donation status as 'Requested' if it was 'Available'
    if (donation.status === 'Available') {
      donation.status = 'Requested';
      donation.statusHistory.push({
        status: 'Requested',
        changedBy: req.user._id,
        timestamp: new Date(),
        note: `Requested by NGO ${req.user.name}`,
      });
      await donation.save();
    }

    // Audit log
    await logAudit({
      userId: req.user._id,
      action: 'DONATION_REQUESTED',
      resourceType: 'request',
      resourceId: request._id,
      details: { donationId, ngo: req.user.name },
      req,
    });

    // Send real-time notification to the donor
    await createAndSendNotification({
      recipient: donation.donor,
      sender: req.user._id,
      type: 'donation_requested',
      title: 'New Claim Request Received!',
      message: `${req.user.name} has requested your donation: "${donation.title}" for ${estimatedBeneficiaries} beneficiaries.`,
      link: `/dashboard/donor`,
      data: { donationId: donation._id, requestId: request._id },
    });

    res.status(201).json({
      success: true,
      message: 'Donation request submitted successfully!',
      request,
    });
  } catch (error) {
    console.error('[Create Request Error]', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while submitting request',
    });
  }
};

/**
 * @desc    Accept a donation request (Donor)
 * @route   PUT /api/requests/:id/accept
 * @access  Private (Donor, Admin)
 */
export const acceptRequest = async (req, res) => {
  try {
    const request = await DonationRequest.findById(req.params.id)
      .populate('donation')
      .populate('ngo', 'name email phone address location');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    const donation = request.donation;

    // Check donor authorization
    if (donation.donor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to accept requests for this donation.',
      });
    }

    // Atomic reservation: check that donation is still 'Available' or 'Requested'
    const updatedDonation = await Donation.findOneAndUpdate(
      {
        _id: donation._id,
        status: { $in: ['Available', 'Requested'] },
      },
      {
        $set: {
          status: 'Accepted',
          acceptedRequest: request._id,
        },
        $push: {
          statusHistory: {
            status: 'Accepted',
            changedBy: req.user._id,
            timestamp: new Date(),
            note: `Request accepted for ${request.ngo.name}`,
          },
        },
      },
      { new: true }
    );

    if (!updatedDonation) {
      return res.status(400).json({
        success: false,
        message: 'This donation has already been accepted or is no longer available.',
      });
    }

    // Mark current request as accepted
    request.status = 'accepted';
    request.respondedAt = new Date();
    request.responseNote = req.body.note || 'Accepted by donor';
    await request.save();

    // Automatically decline any other competing requests for this donation
    await DonationRequest.updateMany(
      {
        donation: donation._id,
        _id: { $ne: request._id },
        status: 'pending',
      },
      {
        $set: {
          status: 'rejected',
          respondedAt: new Date(),
          responseNote: 'Another organization was selected for this donation.',
        },
      }
    );

    // Generate random 6-digit verification codes for collection & delivery handshakes
    const pickupCode = Math.floor(100000 + Math.random() * 900000).toString();
    const deliveryCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Create delivery record
    await Delivery.create({
      donation: donation._id,
      request: request._id,
      ngo: request.ngo._id,
      donor: donation.donor,
      volunteer: request.ngo._id, // default to NGO until volunteer assigned
      pickupLocation: {
        address: donation.pickupLocation?.address || 'Pickup point',
        city: donation.pickupLocation?.city || 'Bangalore',
        coordinates: donation.location?.coordinates || [77.5946, 12.9716],
        contactPhone: donation.pickupLocation?.contactPhone || '',
      },
      dropoffLocation: {
        address: request.ngo.address?.street || 'NGO Distribution Center',
        city: request.ngo.address?.city || 'Bangalore',
        coordinates: request.ngo.location?.coordinates || [77.5946, 12.9716],
        contactPhone: request.ngo.phone || '',
      },
      status: 'scheduled',
      pickupVerificationCode: pickupCode,
      deliveryVerificationCode: deliveryCode,
    });

    // Notify accepted NGO in real-time
    await createAndSendNotification({
      recipient: request.ngo._id,
      sender: req.user._id,
      type: 'request_accepted',
      title: 'Donation Request Approved! 🎉',
      message: `Your request for "${donation.title}" was accepted! Please arrange pickup.`,
      link: `/dashboard/ngo`,
      data: { donationId: donation._id, requestId: request._id },
    });

    res.status(200).json({
      success: true,
      message: 'Request accepted! Handover and delivery workflow initiated.',
      donation: updatedDonation,
      request,
    });
  } catch (error) {
    console.error('[Accept Request Error]', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while accepting request',
    });
  }
};

/**
 * @desc    Reject a donation request (Donor)
 * @route   PUT /api/requests/:id/reject
 * @access  Private (Donor, Admin)
 */
export const rejectRequest = async (req, res) => {
  try {
    const request = await DonationRequest.findById(req.params.id).populate('donation');
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (
      request.donation.donor.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reject requests for this donation.',
      });
    }

    request.status = 'rejected';
    request.respondedAt = new Date();
    request.responseNote = req.body.note || 'Declined by donor';
    await request.save();

    // Check if there are other pending requests; if none, revert donation status to 'Available'
    const pendingCount = await DonationRequest.countDocuments({
      donation: request.donation._id,
      status: 'pending',
    });

    if (pendingCount === 0 && request.donation.status === 'Requested') {
      await Donation.findByIdAndUpdate(request.donation._id, {
        status: 'Available',
      });
    }

    // Notify NGO
    await createAndSendNotification({
      recipient: request.ngo,
      sender: req.user._id,
      type: 'request_rejected',
      title: 'Donation Request Update',
      message: `Your request for "${request.donation.title}" could not be accepted at this time.`,
      link: `/dashboard/ngo`,
      data: { donationId: request.donation._id },
    });

    res.status(200).json({
      success: true,
      message: 'Request rejected',
      request,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to reject request',
    });
  }
};

/**
 * @desc    Get requests made by the logged-in NGO
 * @route   GET /api/requests/my-requests
 * @access  Private (NGO)
 */
export const getMyRequests = async (req, res) => {
  try {
    const requests = await DonationRequest.find({ ngo: req.user._id })
      .populate({
        path: 'donation',
        populate: { path: 'donor', select: 'name email phone avatar' },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch your requests',
    });
  }
};
