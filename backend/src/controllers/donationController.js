import Donation from '../models/Donation.js';
import DonationRequest from '../models/DonationRequest.js';
import { logAudit } from '../utils/logger.js';
import { createAndSendNotification, emitToRole } from '../sockets/socketHandler.js';
import { matchNGOsForDonation } from '../services/matchingService.js';

/**
 * @desc    Create a new food donation listing
 * @route   POST /api/donations
 * @access  Private (Donor, Admin)
 */
export const createDonation = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      quantity,
      unit,
      images,
      preparationDate,
      storageType,
      allergens,
      dietaryInfo,
      collectionDeadline,
      pickupLocation,
      coordinates,
      safetyDeclaration,
    } = req.body;

    // Validate required fields
    if (!title || !description || !category || !quantity || !collectionDeadline) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, category, quantity, and collection deadline.',
      });
    }

    // Validate that collection deadline is in the future
    if (new Date(collectionDeadline) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Collection deadline must be a future date and time.',
      });
    }

    // Geo coordinates (default to user location or Bangalore if missing)
    const coords =
      coordinates && Array.isArray(coordinates) && coordinates.length === 2
        ? coordinates
        : req.user.location?.coordinates || [77.5946, 12.9716];

    const donation = await Donation.create({
      donor: req.user._id,
      organization: req.user.organization?._id || null,
      title,
      description,
      category,
      quantity: Number(quantity),
      unit: unit || 'portions',
      images: images || [],
      preparationDate: preparationDate ? new Date(preparationDate) : new Date(),
      storageType: storageType || 'Room Temperature',
      allergens: allergens || [],
      dietaryInfo: dietaryInfo || [],
      collectionDeadline: new Date(collectionDeadline),
      pickupLocation: {
        address: pickupLocation?.address || req.user.address?.street || 'City Center',
        landmark: pickupLocation?.landmark || '',
        city: pickupLocation?.city || req.user.address?.city || 'Bangalore',
        state: pickupLocation?.state || req.user.address?.state || 'Karnataka',
        zipCode: pickupLocation?.zipCode || req.user.address?.zipCode || '',
        instructions: pickupLocation?.instructions || '',
        contactPhone: pickupLocation?.contactPhone || req.user.phone || '',
      },
      location: {
        type: 'Point',
        coordinates: coords,
      },
      status: 'Available',
      safetyDeclaration: safetyDeclaration || {
        isFresh: true,
        preparedHygienically: true,
        properlyPackaged: true,
        confirmedByDonor: true,
      },
      statusHistory: [
        {
          status: 'Available',
          changedBy: req.user._id,
          timestamp: new Date(),
          note: 'Donation created and listed on marketplace',
        },
      ],
    });

    // Audit log
    await logAudit({
      userId: req.user._id,
      action: 'DONATION_CREATED',
      resourceType: 'donation',
      resourceId: donation._id,
      details: { title: donation.title, quantity: donation.quantity, unit: donation.unit },
      req,
    });

    // Notify all NGOs in real time via Socket.IO
    emitToRole('ngo', 'new_donation_available', {
      donationId: donation._id,
      title: donation.title,
      category: donation.category,
      quantity: `${donation.quantity} ${donation.unit}`,
      city: donation.pickupLocation.city,
    });

    res.status(201).json({
      success: true,
      message: 'Food donation posted successfully to the marketplace!',
      donation,
    });
  } catch (error) {
    console.error('[Create Donation Error]', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while creating donation',
    });
  }
};

/**
 * @desc    Get all donations / Marketplace Search with filters
 * @route   GET /api/donations
 * @access  Public
 */
export const getDonations = async (req, res) => {
  try {
    const {
      category,
      status,
      search,
      sortBy,
      longitude,
      latitude,
      maxDistanceKm,
    } = req.query;

    const query = {};

    // Filter by status (default to Available for marketplace unless explicitly queried)
    if (status) {
      query.status = status;
    } else {
      query.status = 'Available';
      // Do not show expired donations in marketplace
      query.collectionDeadline = { $gt: new Date() };
    }

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Search keyword in title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'pickupLocation.city': { $regex: search, $options: 'i' } },
      ];
    }

    // Geospatial search if coordinates provided
    if (longitude && latitude) {
      const maxDistanceMeters = (parseFloat(maxDistanceKm) || 30) * 1000;
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: maxDistanceMeters,
        },
      };
    }

    // Sorting logic
    let sortOptions = { createdAt: -1 }; // default newest
    if (sortBy === 'urgent_deadline') {
      sortOptions = { collectionDeadline: 1 }; // closest deadline first
    } else if (sortBy === 'quantity_desc') {
      sortOptions = { quantity: -1 };
    }

    const donations = await Donation.find(query)
      .populate('donor', 'name role avatar')
      .populate('organization', 'name type verificationStatus')
      .sort(sortOptions)
      .limit(50);

    res.status(200).json({
      success: true,
      count: donations.length,
      donations,
    });
  } catch (error) {
    console.error('[Get Donations Error]', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while fetching donations',
    });
  }
};

/**
 * @desc    Get single donation by ID
 * @route   GET /api/donations/:id
 * @access  Public
 */
export const getDonationById = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('donor', 'name email phone avatar address role')
      .populate('organization')
      .populate({
        path: 'acceptedRequest',
        populate: { path: 'ngo', select: 'name email phone' },
      });

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation listing not found',
      });
    }

    res.status(200).json({
      success: true,
      donation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch donation details',
    });
  }
};

/**
 * @desc    Get donor's own donations
 * @route   GET /api/donations/my-donations
 * @access  Private (Donor, Admin)
 */
export const getMyDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ donor: req.user._id })
      .populate({
        path: 'acceptedRequest',
        populate: { path: 'ngo', select: 'name email phone' },
      })
      .sort({ createdAt: -1 });

    // Also fetch pending requests count for these donations
    const donationIds = donations.map((d) => d._id);
    const requests = await DonationRequest.find({
      donation: { $in: donationIds },
    }).populate('ngo', 'name email phone address');

    res.status(200).json({
      success: true,
      count: donations.length,
      donations,
      requests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch user donations',
    });
  }
};

/**
 * @desc    Get donor statistics summary
 * @route   GET /api/donations/donor-stats
 * @access  Private (Donor)
 */
export const getDonorStats = async (req, res) => {
  try {
    const donations = await Donation.find({ donor: req.user._id });

    const totalDonations = donations.length;
    const activeDonations = donations.filter((d) =>
      ['Available', 'Requested', 'Accepted', 'Assigned', 'Collected'].includes(d.status)
    ).length;
    const completedDonations = donations.filter((d) => d.status === 'Delivered').length;

    let totalMealsRedistributed = 0;
    donations
      .filter((d) => d.status === 'Delivered')
      .forEach((d) => {
        totalMealsRedistributed += d.estimatedMeals || 0;
      });

    res.status(200).json({
      success: true,
      stats: {
        totalDonations,
        activeDonations,
        completedDonations,
        totalMealsRedistributed,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch donor stats',
    });
  }
};

/**
 * @desc    Get Smart NGO Recommendations for a donation
 * @route   GET /api/donations/:id/recommendations
 * @access  Private
 */
export const getRecommendedNGOs = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    const matches = await matchNGOsForDonation(donation);

    res.status(200).json({
      success: true,
      donationId: donation._id,
      matches,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to compute NGO recommendations',
    });
  }
};
