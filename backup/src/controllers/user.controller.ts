import { Request, Response } from 'express';
import User from '../models/user.model';

/**
 * Get user profile
 * @route GET /api/users/profile
 */
export const getProfile = async (req: Request, res: Response) => {
  try {
    // User is attached to request by auth middleware
    const user = req.user as any;
    
    if (!user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    res.status(200).json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isVerified: user.isVerified,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Update user profile
 * @route PUT /api/users/profile
 */
export const updateProfile = async (req: Request, res: Response) => {
  try {
    // User is attached to request by auth middleware
    const currentUser = req.user as any;
    
    if (!currentUser) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { firstName, lastName } = req.body;

    // Update user information
    const user = await User.findByPk(currentUser.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    
    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Change password
 * @route PUT /api/users/change-password
 */
export const changePassword = async (req: Request, res: Response) => {
  try {
    // User is attached to request by auth middleware
    const currentUser = req.user as any;
    
    if (!currentUser) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { currentPassword, newPassword } = req.body;

    // Get user from database to use the comparePassword method
    const user = await User.findByPk(currentUser.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has a password (wasn't created with Google OAuth)
    if (!user.password) {
      return res.status(400).json({
        message: 'This account was created with Google. You cannot change the password.',
      });
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export default {
  getProfile,
  updateProfile,
  changePassword,
}; 