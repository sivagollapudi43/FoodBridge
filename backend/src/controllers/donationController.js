import Donation from '../models/Donation.js';

/**
 * @desc    Create new available food listing
 * @route   POST /api/donations
 * @access  Private (Logged-in User or Admin)
 */
export const createDonation = async (req, res) => {
  try {
    const {
      title,
      category,
      quantity,
      description,
      pickupAddress,
      city,
      contactPhone,
      availableUntil,
    } = req.body;

    if (!title || !quantity || !pickupAddress || !contactPhone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide food title, quantity, pickup address, and contact phone number',
      });
    }

    const donation = await Donation.create({
      user: req.user._id,
      title,
      category: category || 'Cooked Food',
      quantity,
      description: description || '',
      pickupAddress,
      city: city || 'Bangalore',
      contactPhone,
      availableUntil: availableUntil || 'Today before 9:00 PM',
      status: 'Available',
    });

    res.status(201).json({
      success: true,
      message: 'Available food posted successfully!',
      donation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while adding food',
    });
  }
};

/**
 * @desc    Get all available food listings (with search & filter)
 * @route   GET /api/donations
 * @access  Public
 */
export const getDonations = async (req, res) => {
  try {
    const { category, search, status } = req.query;
    const query = {};

    // Filter by status (default to Available, or search all if status='all')
    if (status && status !== 'all') {
      query.status = status;
    } else if (!status) {
      query.status = 'Available';
    }

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Keyword search in title, description, or address
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { pickupAddress: { $regex: search, $options: 'i' } },
      ];
    }

    const donations = await Donation.find(query)
      .populate('user', 'name email phone')
      .populate('claimedBy', 'name phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: donations.length,
      donations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch food listings',
    });
  }
};

/**
 * @desc    Get food added by current logged-in user
 * @route   GET /api/donations/my-food
 * @access  Private
 */
export const getMyFood = async (req, res) => {
  try {
    const donations = await Donation.find({ user: req.user._id })
      .populate('claimedBy', 'name phone email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: donations.length,
      donations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch your food listings',
    });
  }
};

/**
 * @desc    Claim an available food listing
 * @route   PUT /api/donations/:id/claim
 * @access  Private
 */
export const claimFood = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Food listing not found',
      });
    }

    if (donation.status !== 'Available') {
      return res.status(400).json({
        success: false,
        message: `This food has already been ${donation.status.toLowerCase()}`,
      });
    }

    donation.status = 'Claimed';
    donation.claimedBy = req.user._id;
    await donation.save();

    res.status(200).json({
      success: true,
      message: 'Food claimed successfully! Please contact the donor to coordinate pickup.',
      donation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to claim food',
    });
  }
};

/**
 * @desc    Delete food listing (Creator or Admin)
 * @route   DELETE /api/donations/:id
 * @access  Private
 */
export const deleteFood = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Food listing not found',
      });
    }

    // Check ownership or admin
    if (donation.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this food listing',
      });
    }

    await Donation.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Food listing deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete food listing',
    });
  }
};
