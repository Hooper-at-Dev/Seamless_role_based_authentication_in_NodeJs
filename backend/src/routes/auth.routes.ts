import express from 'express';
import passport from 'passport';
import authController from '../controllers/auth.controller';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Create a rate limiter (add express-rate-limit to your dependencies)
const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window per IP
  message: { message: 'Too many verification attempts, please try again later' }
});

// Registration and email verification
router.post('/register', authController.register);
router.post('/verify-email', verifyLimiter, authController.verifyEmail);
router.post('/resend-otp', authController.resendOTP);
router.post('/register-admin', authController.registerAdmin); // Admin registration route (dev only)
router.post('/register-prime-admin', authController.registerPrimeAdmin); // Prime Admin registration route (dev only, can only be one)

// Login
router.post('/login', authController.login);

// Password reset
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Note: Google OAuth is not supported for admin authentication
// Admin accounts must use email/password authentication

export default router; 