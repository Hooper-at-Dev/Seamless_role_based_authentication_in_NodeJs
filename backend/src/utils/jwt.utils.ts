import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '86400'; // 24 hours in seconds

/**
 * Generate a JWT token for a user
 * @param userId The user ID to include in the token
 * @param email The user's email
 * @param role The user's role
 * @returns {string} JWT token
 */
export const generateToken = (userId: number, email: string, role: string): string => {
  return jwt.sign({ userId, email, role }, JWT_SECRET, {
    expiresIn: parseInt(JWT_EXPIRATION, 10),
  });
};

/**
 * Verify a JWT token
 * @param token The token to verify
 * @returns {any} The decoded token payload or null if invalid
 */
export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export default {
  generateToken,
  verifyToken,
};