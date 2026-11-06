import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware: Verify JWT and attach authenticated user to request
 */
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'supersecret_jwt_key_change_in_production_foodbridge_2026'
      );

      req.user = await User.findById(decoded.id).populate('organization');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'The user belonging to this token no longer exists.',
        });
      }

      if (req.user.status === 'suspended') {
        return res.status(403).json({
          success: false,
          message: 'Your account has been suspended by an administrator. Please contact support.',
        });
      }

      return next();
    } catch (error) {
      console.error('[Auth Middleware Error]', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, invalid or expired token',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no authorization token provided',
    });
  }
};

/**
 * Middleware: Restrict access to designated roles
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${roles.join(', ')}] roles. Your role is '${req.user?.role}'.`,
      });
    }
    next();
  };
};

/**
 * Middleware: Require verified account status (particularly for NGOs)
 */
export const requireVerified = (req, res, next) => {
  if (req.user.role === 'ngo' && !req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message:
        'Access Denied: Your NGO registration is pending verification by FoodBridge administrators. You will be able to claim and receive donations once approved.',
    });
  }
  next();
};
