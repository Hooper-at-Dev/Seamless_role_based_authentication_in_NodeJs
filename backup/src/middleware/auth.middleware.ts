import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { verifyToken } from '../utils/jwt.utils';
import User from '../models/user.model';
import { UserRole } from '../models/user.model';
import jwt from 'jsonwebtoken';

/**
 * Middleware to authenticate requests using JWT
 */
export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  console.log('Auth header:', authHeader ? `${authHeader.substring(0, 15)}...` : 'none');
  
  if (!authHeader) {
    return res.status(401).json({ message: 'No authorization header provided' });
  }
  
  const parts = authHeader.split(' ');
  
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Invalid authorization format, expected "Bearer token"' });
  }
  
  const token = parts[1];
  
  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, decoded) => {
    if (err) {
      console.error('JWT verification error:', err.message);
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    
    req.user = decoded;
    console.log('Authenticated user:', {
      id: (decoded as any).id,
      email: (decoded as any).email,
      role: (decoded as any).role
    });
    
    next();
  });
};

/**
 * Middleware to ensure user's email is verified
 */
export const ensureEmailVerified = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as any;
  
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!user.isVerified) {
    return res.status(403).json({ message: 'Email not verified' });
  }

  next();
};

/**
 * Extract user from authorization header without requiring authentication
 */
export const extractUserFromToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (decoded && decoded.id) {
      const user = await User.findByPk(decoded.id);
      if (user) {
        req.user = user;
      }
    }
  }

  next();
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as { id: number; email: string; role: string };
  
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized: No user found in request' });
  }
  
  console.log('Checking admin access for role:', user.role);
  
  // Check for both admin AND prime_admin roles
  if (user.role === UserRole.ADMIN || user.role === UserRole.PRIME_ADMIN) {
    return next();
  }
  
  return res.status(403).json({ message: 'Forbidden: Admin access required' });
};

export const isPrimeAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as { id: number; email: string; role: string };
  
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized: No user found in request' });
  }
  
  console.log('Checking prime admin access for role:', user.role);
  
  if (user.role === UserRole.PRIME_ADMIN) {
    return next();
  }
  
  return res.status(403).json({ message: 'Forbidden: Prime Admin access required' });
};

export default {
  authenticateJWT,
  ensureEmailVerified,
  extractUserFromToken,
  isAdmin,
  isPrimeAdmin,
}; 