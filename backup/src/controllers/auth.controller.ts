import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import User, { UserRole } from '../models/user.model';
import { generateToken } from '../utils/jwt.utils';
import { generateOTP, verifyOTP, sendOTPByEmail } from '../utils/otp.utils';

/**
 * Register a new user
 * @route POST /api/auth/register
 */
export const register = async (req: Request, res: Response) => {
  try {
    console.log('Registration attempt with data:', { ...req.body, password: '[REDACTED]' });
    
    const { email, password, firstName, lastName, role } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: 'All fields are required: email, password, firstName, lastName' });
    }
    
    // Add email domain validation for regular users
    if (role !== UserRole.ADMIN && role !== UserRole.PRIME_ADMIN) {
      // Change from @university.edu.in to @bennett.edu.in
      if (!email.toLowerCase().endsWith('@bennett.edu.in')) {
        return res.status(400).json({ 
          message: 'Regular user accounts require an email address ending with @bennett.edu.in'
        });
      }
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Determine role - only allow admin if specifically requested and environment is development
    // In production, admin creation would typically be restricted or handled differently
    let userRole = UserRole.USER;
    if (role === UserRole.ADMIN && process.env.NODE_ENV === 'development') {
      // If requesting admin role, ensure password is provided (no Google auth for admins)
      if (!password || password.trim() === '') {
        return res.status(400).json({ 
          message: 'Admin accounts require a password. Google authentication is not supported for admin accounts.'
        });
      }
      userRole = UserRole.ADMIN;
    }

    // Generate OTP for email verification
    const otp = generateOTP();
    console.log('Generated OTP for testing:', otp); // Log OTP for testing purposes
   
    const otpExpiration = new Date();
    otpExpiration.setMinutes(otpExpiration.getMinutes() + 5); // 5 minutes from now

    // Create new user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      otpSecret: otp,
      otpExpiration,
      role: userRole,
      // If admin role, ensure no Google ID
      googleId: userRole === UserRole.ADMIN ? null : undefined,
    });

    console.log('User created successfully with ID:', user.id);

    // Try to send OTP via email, but continue even if it fails
    try {
      const emailSent = await sendOTPByEmail(email, otp);
      if (!emailSent) {
        console.warn('Failed to send verification email, but continuing with registration');
      } else {
        console.log('Verification email sent successfully');
      }
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      // Continue with registration despite email failure
    }

    res.status(201).json({
      message: 'User registered successfully. Please verify your email with the OTP sent.',
      userId: user.id,
      role: user.role,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error', details: process.env.NODE_ENV === 'development' ? String(error) : undefined });
  }
};

/**
 * Verify user's email with OTP
 * @route POST /api/auth/verify-email
 */
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { userId, otp } = req.body;

    // Find the user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if OTP has expired
    if (!user.otpExpiration || new Date() > user.otpExpiration) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // Verify OTP
    if (user.otpSecret !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Update user as verified
    user.isVerified = true;
    user.otpSecret = null;
    user.otpExpiration = null;
    await user.save();

    // Generate JWT token
    const token = generateToken(user.id, user.email, user.role);

    res.status(200).json({
      message: 'Email verified successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        credits: user.credits
      },
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Register a new admin (development mode only)
 * @route POST /api/auth/register-admin
 */
export const registerAdmin = async (req: Request, res: Response) => {
  // Only allow in development mode for security
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ message: 'Admin registration is not allowed in production mode' });
  }

  try {
    const { email, password, firstName, lastName } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: 'All fields are required: email, password, firstName, lastName' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Admin accounts must use password authentication (not Google)
    if (!password || password.trim() === '') {
      return res.status(400).json({ 
        message: 'Admin accounts require a password. Google authentication is not supported for admin accounts.'
      });
    }

    // Generate OTP for email verification
    const otp = generateOTP();
    console.log('Generated OTP for admin testing:', otp);
    
    const otpExpiration = new Date();
    otpExpiration.setMinutes(otpExpiration.getMinutes() + 5);

    // Create new admin user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      otpSecret: otp,
      otpExpiration,
      role: UserRole.ADMIN, // Set role as admin
      googleId: null, // Ensure no Google ID is set
    });

    // Try to send OTP via email
    try {
      await sendOTPByEmail(email, otp);
    } catch (emailError) {
      console.error('Error sending verification email to admin:', emailError);
    }

    res.status(201).json({
      message: 'Admin registered successfully. Please verify your email with the OTP sent.',
      userId: user.id,
      role: user.role,
    });
  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Resend OTP to user's email
 * @route POST /api/auth/resend-otp
 */
export const resendOTP = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Find the user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is already verified
    if (user.isVerified) {
      return res.status(400).json({ message: 'User is already verified' });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiration = new Date();
    otpExpiration.setMinutes(otpExpiration.getMinutes() + 5); // 5 minutes from now

    // Update user with new OTP
    user.otpSecret = otp;
    user.otpExpiration = otpExpiration;
    await user.save();

    // Send OTP via email
    const emailSent = await sendOTPByEmail(email, otp);
    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send verification code' });
    }

    res.status(200).json({
      message: 'Verification code sent successfully',
      userId: user.id,
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find the user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is verified
    if (!user.isVerified) {
      // Generate new OTP for unverified users
      const otp = generateOTP();
      const otpExpiration = new Date();
      otpExpiration.setMinutes(otpExpiration.getMinutes() + 5); // 5 minutes from now

      // Update user with new OTP
      user.otpSecret = otp;
      user.otpExpiration = otpExpiration;
      await user.save();

      // Send OTP via email
      await sendOTPByEmail(email, otp);

      return res.status(403).json({
        message: 'Email not verified. A new verification code has been sent.',
        userId: user.id,
      });
    }

    // For admin or prime admin roles, always require password authentication
    if ((user.role === UserRole.ADMIN || user.role === UserRole.PRIME_ADMIN) && (!user.password || user.googleId)) {
      return res.status(401).json({
        message: 'Admin accounts must use password authentication. Google authentication is not supported for admin accounts.'
      });
    }

    // Check if password is correct (only for users with password)
    if (user.password) {
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    } else {
      // User was created with Google OAuth, so they shouldn't be trying to log in with password
      return res.status(401).json({
        message: 'This account was created with Google. Please use Google sign-in.',
      });
    }

    // Generate JWT token
    const token = generateToken(user.id, user.email, user.role);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        credits: user.credits
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Google OAuth callback
 * @route GET /api/auth/google/callback
 */
export const googleCallback = (req: Request, res: Response) => {
  // The user data is attached to req.user by passport
  const user = req.user as any;
  
  if (!user) {
    return res.status(401).json({ message: 'Authentication failed' });
  }

  // Prevent admin users from using Google authentication
  if (user.role === UserRole.ADMIN || user.role === UserRole.PRIME_ADMIN) {
    return res.status(403).json({ 
      message: 'Admin accounts cannot use Google authentication. Please use email and password login instead.'
    });
  }

  // Generate JWT token
  const token = generateToken(user.id, user.email, user.role);

  // Redirect to frontend with token
  res.status(200).json({
    message: 'Google authentication successful',
    token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
  });
};

/**
 * Request password reset
 * @route POST /api/auth/forgot-password
 */
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Find the user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user was created with Google OAuth
    if (!user.password) {
      return res.status(400).json({
        message: 'This account was created with Google. Please use Google sign-in.',
      });
    }

    // Generate OTP for password reset
    const otp = generateOTP();
    const otpExpiration = new Date();
    otpExpiration.setMinutes(otpExpiration.getMinutes() + 5); // 5 minutes from now

    // Update user with OTP
    user.otpSecret = otp;
    user.otpExpiration = otpExpiration;
    await user.save();

    // Send OTP via email
    const emailSent = await sendOTPByEmail(email, otp);
    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send verification code' });
    }

    res.status(200).json({
      message: 'Password reset code sent to your email',
      userId: user.id,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Reset password with OTP
 * @route POST /api/auth/reset-password
 */
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { userId, otp, newPassword } = req.body;

    // Find the user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if OTP has expired
    if (user.otpExpiration && new Date() > user.otpExpiration) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Verify OTP
    if (user.otpSecret !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Update password
    user.password = newPassword;
    user.otpSecret = null;
    user.otpExpiration = null;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Register a prime admin account (development mode only, can only exist once)
 * @route POST /api/auth/register-prime-admin
 */
export const registerPrimeAdmin = async (req: Request, res: Response) => {
  // Only allow in development mode for security
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ message: 'Prime Admin registration is not allowed in production mode' });
  }

  try {
    // Check if a prime admin already exists
    const existingPrimeAdmin = await User.findOne({ where: { role: UserRole.PRIME_ADMIN } });
    if (existingPrimeAdmin) {
      return res.status(400).json({ 
        message: 'A Prime Admin account already exists. There can only be one Prime Admin.'
      });
    }

    const { email, password, firstName, lastName } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: 'All fields are required: email, password, firstName, lastName' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Prime Admin accounts must use password authentication (not Google)
    if (!password || password.trim() === '') {
      return res.status(400).json({ 
        message: 'Prime Admin accounts require a password. Google authentication is not supported.'
      });
    }

    // Generate OTP for email verification
    const otp = generateOTP();
    console.log('Generated OTP for prime admin testing:', otp);
    
    const otpExpiration = new Date();
    otpExpiration.setMinutes(otpExpiration.getMinutes() + 5);

    // Create new prime admin user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      otpSecret: otp,
      otpExpiration,
      role: UserRole.PRIME_ADMIN, // Set role as prime admin
      googleId: null, // Ensure no Google ID is set
    });

    // Try to send OTP via email
    try {
      await sendOTPByEmail(email, otp);
    } catch (emailError) {
      console.error('Error sending verification email to prime admin:', emailError);
    }

    res.status(201).json({
      message: 'Prime Admin registered successfully. Please verify your email with the OTP sent.',
      userId: user.id,
      role: user.role,
    });
  } catch (error) {
    console.error('Prime Admin registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export default {
  register,
  verifyEmail,
  resendOTP,
  login,
  googleCallback,
  forgotPassword,
  resetPassword,
  registerAdmin,
  registerPrimeAdmin,

}; 


