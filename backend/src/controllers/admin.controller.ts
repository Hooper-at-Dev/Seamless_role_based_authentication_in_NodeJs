import { Request, Response } from 'express';
import User, { UserRole } from '../models/user.model';

/**
 * Get all users
 * @route GET /api/admin/users
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password', 'otpSecret'] } // Don't return sensitive data
    });
    
    res.status(200).json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get all admins (Prime Admin only)
 * @route GET /api/admin/admins
 */
export const getAllAdmins = async (req: Request, res: Response) => {
  try {
    // Only accessible by prime admin, verified by middleware
    const admins = await User.findAll({
      where: { role: UserRole.ADMIN },
      attributes: { exclude: ['password', 'otpSecret'] }
    });
    
    res.status(200).json(admins);
  } catch (error) {
    console.error('Get all admins error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Create a new admin account (Prime Admin only)
 * @route POST /api/admin/admins
 */
export const createAdmin = async (req: Request, res: Response) => {
  try {
    // Ensure the request is from a prime admin
    const requestingUser = req.user as { id: number; role: string };
    if (requestingUser.role !== UserRole.PRIME_ADMIN) {
      return res.status(403).json({ message: 'Only Prime Admins can create admin accounts' });
    }

    const { email, password, firstName, lastName } = req.body;

    // Validate required fields (no email domain validation for admins)
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create new admin user (verified and ready to use)
    const admin = await User.create({
      email,
      password,
      firstName,
      lastName,
      isVerified: true, // Auto-verify admin created by prime admin
      role: UserRole.ADMIN,
      googleId: null // Ensure no Google ID is set
    });

    res.status(201).json({
      message: 'Admin created successfully',
      admin: {
        id: admin.id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get user by ID
 * @route GET /api/admin/users/:id
 */
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password', 'otpSecret'] }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Get user by id error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Update user
 * @route PUT /api/admin/users/:id
 */
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, isVerified } = req.body;
    
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update fields if provided
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (email !== undefined) user.email = email;
    if (isVerified !== undefined) user.isVerified = isVerified;
    
    await user.save();
    
    res.status(200).json({
      message: 'User updated successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Delete user
 * @route DELETE /api/admin/users/:id
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const requestUser = req.user as any;

    // Prevent admin from deleting themselves
    if (user.id === requestUser.id) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    // Regular admins cannot delete other admins, only prime admin can
    if (user.role === UserRole.ADMIN && requestUser.role !== UserRole.PRIME_ADMIN) {
      return res.status(403).json({ message: 'Only prime admin can delete admin accounts' });
    }

    // Nobody can delete the prime admin
    if (user.role === UserRole.PRIME_ADMIN) {
      return res.status(403).json({ message: 'The prime admin account cannot be deleted' });
    }
    
    await user.destroy();
    
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Change user role
 * @route PUT /api/admin/users/:id/role
 */
export const changeUserRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    // Validate role
    if (!Object.values(UserRole).includes(role)) {
      return res.status(400).json({ 
        message: `Invalid role. Role must be one of: ${Object.values(UserRole).join(', ')}` 
      });
    }
    
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const requestUser = req.user as any;

    // Prevent users from changing their own role
    if (user.id === requestUser.id) {
      return res.status(400).json({ message: 'You cannot change your own role' });
    }

    // Only prime admin can promote to admin or demote from admin
    if ((role === UserRole.ADMIN || user.role === UserRole.ADMIN) && requestUser.role !== UserRole.PRIME_ADMIN) {
      return res.status(403).json({ message: 'Only prime admin can promote to or demote from admin role' });
    }

    // Nobody can create another prime admin or change the prime admin's role
    if (role === UserRole.PRIME_ADMIN || user.role === UserRole.PRIME_ADMIN) {
      return res.status(403).json({ message: 'Prime admin role cannot be assigned or changed' });
    }
    
    user.role = role;
    await user.save();
    
    res.status(200).json({
      message: 'User role updated successfully',
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Change user role error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Delete admin
 * @route DELETE /api/admin/admins/:id
 */
export const deleteAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if the admin exists
    const admin = await User.findByPk(id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    // Make sure we're not deleting a prime admin
    if (admin.role === UserRole.PRIME_ADMIN) {
      return res.status(403).json({ message: 'Cannot delete a Prime Admin account' });
    }
    
    // Delete the admin
    await admin.destroy();
    
    return res.status(200).json({ message: 'Admin deleted successfully' });
  } catch (error) {
    console.error('Error deleting admin:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export default {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  changeUserRole,
  getAllAdmins,
  createAdmin,
  deleteAdmin
}; 