import jwt from 'jsonwebtoken';

/**
 * Generate a signed JWT token
 */
export const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'supersecret_jwt_key_change_in_production_foodbridge_2026',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

