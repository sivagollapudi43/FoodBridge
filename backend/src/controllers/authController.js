import User from '../models/User.js';
import Organization from '../models/Organization.js';
import { generateToken } from '../utils/token.js';
import { logAudit } from '../utils/logger.js';

/**
 * @desc    Register a new user (Donor, NGO, Volunteer)
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      address,
      organizationName,
      organizationType,
      registrationNumber,
      vehicleType,
      coordinates,
    } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password, and role',
      });
    }

    // Check if email already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists',
      });
    }

    // Prepare coordinates: default to Bangalore [77.5946, 12.9716]
    const userCoords =
      coordinates && Array.isArray(coordinates) && coordinates.length === 2
        ? coordinates
        : [77.5946, 12.9716];

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role,
      phone: phone || '',
      address: address || {},
      location: {
        type: 'Point',
        coordinates: userCoords,
      },
      isVerified: role !== 'ngo', // NGOs require verification
      volunteerProfile:
        role === 'volunteer'
          ? {
              vehicleType: vehicleType || 'motorcycle',
              isAvailable: true,
              completedDeliveries: 0,
            }
          : undefined,
    });

    // Create Organization if Donor or NGO
    if (['donor', 'ngo'].includes(role) && organizationName) {
      const org = await Organization.create({
        name: organizationName,
        type: organizationType || (role === 'ngo' ? 'ngo' : 'restaurant'),
        registrationNumber: registrationNumber || '',
        contactEmail: email.toLowerCase(),
        contactPhone: phone || '',
        address: address || {},
        location: {
          type: 'Point',
          coordinates: userCoords,
        },
        verificationStatus: role === 'ngo' ? 'pending' : 'verified',
        owner: user._id,
      });

      user.organization = org._id;
      await user.save();
    }

    // Log audit
    await logAudit({
      userId: user._id,
      action: 'USER_REGISTERED',
      resourceType: 'user',
      resourceId: user._id,
      details: { role: user.role, email: user.email },
      req,
    });

    const token = generateToken(user._id, user.role);

    const populatedUser = await User.findById(user._id)
      .populate('organization')
      .select('-password');

    res.status(201).json({
      success: true,
      message:
        role === 'ngo'
          ? 'Registration successful! Your NGO verification is pending administrative review.'
          : 'Registration successful!',
      token,
      user: populatedUser,
    });
  } catch (error) {
    console.error('[Register Error]', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration',
    });
  }
};

/**
 * @desc    Login user & get JWT token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+password')
      .populate('organization');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'This account has been suspended. Please contact platform administrators.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    // Record audit log
    await logAudit({
      userId: user._id,
      action: 'USER_LOGIN',
      resourceType: 'user',
      resourceId: user._id,
      req,
    });

    // Remove password before sending
    user.password = undefined;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user,
    });
  } catch (error) {
    console.error('[Login Error]', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during login',
    });
  }
};

/**
 * @desc    Get currently authenticated user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('organization');
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch current user profile',
    });
  }
};

/**
 * @desc    Update current user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { name, phone, address, volunteerProfile, coordinates } = req.body;

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = { ...user.address, ...address };
    if (volunteerProfile && user.role === 'volunteer') {
      user.volunteerProfile = { ...user.volunteerProfile, ...volunteerProfile };
    }
    if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
      user.location = { type: 'Point', coordinates };
    }

    await user.save();

    const updatedUser = await User.findById(user._id).populate('organization');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update profile',
    });
  }
};

