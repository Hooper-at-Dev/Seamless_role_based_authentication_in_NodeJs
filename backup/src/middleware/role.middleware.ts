import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/user.model';

/**
 * Middleware to ensure user has admin role
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as any;
  
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (user.role !== UserRole.ADMIN && user.role !== UserRole.PRIME_ADMIN) {
    return res.status(403).json({ message: 'Forbidden: Admin access required' });
  }

  next();
};

/**
 * Middleware to ensure user has prime admin role
 */
export const requirePrimeAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as any;
  
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (user.role !== UserRole.PRIME_ADMIN) {
    return res.status(403).json({ message: 'Forbidden: Prime Admin access required' });
  }

  next();
};

/**
 * Middleware to ensure user has specified role or higher
 * @param role The minimum role required
 */
export const requireRole = (role: UserRole) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // If admin is required and user is not admin or prime admin
    if (role === UserRole.ADMIN && user.role !== UserRole.ADMIN && user.role !== UserRole.PRIME_ADMIN) {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }

    // If prime admin is required and user is not prime admin
    if (role === UserRole.PRIME_ADMIN && user.role !== UserRole.PRIME_ADMIN) {
      return res.status(403).json({ message: 'Forbidden: Prime Admin access required' });
    }

    next();
  };
};

export default {
  requireAdmin,
  requirePrimeAdmin,
  requireRole,
}; 