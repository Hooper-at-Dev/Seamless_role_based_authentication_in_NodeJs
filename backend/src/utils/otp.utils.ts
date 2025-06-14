import speakeasy from 'speakeasy';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import crypto from 'crypto';

declare module 'speakeasy';

dotenv.config();

/**
 * Generate a new OTP code
 * @returns {string} OTP code
 */
export const generateOTP = (): string => {
  // Generate a 6-digit random OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Don't log the OTP in production - only for debugging during development
  if (process.env.NODE_ENV === 'development') {
    // Still log it to the server console for testing, but not to API responses
    console.log('Generated OTP (for development only):', otp);
  }
  
  return otp;
};

/**
 * Verify an OTP code
 * @param token The OTP code to verify
 * @returns {boolean} Whether the OTP is valid
 */
export const verifyOTP = (token: string): boolean => {
  try {
    const otpSecret = process.env.OTP_SECRET;
    
    if (!otpSecret || otpSecret === 'your-otp-secret-key') {
      console.warn('OTP_SECRET is not properly configured. OTP verification may not work correctly.');
    }
    
    return speakeasy.totp.verify({
      secret: otpSecret || 'your-otp-secret-key',
      token,
      digits: 6,
      step: 300, // 5 minutes
      window: 1, // Allow a window of +/- 1 step to account for clock drift
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return false;
  }
};

/**
 * Send OTP via email
 * @param email The recipient's email
 * @param otp The OTP code to send
 * @returns {Promise<boolean>} Whether the email was sent successfully
 */
export const sendOTPByEmail = async (email: string, otp: string): Promise<boolean> => {
  try {
    console.log('Attempting to send OTP email to:', email);
    
    // Check if email configuration is available
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_APP_PASSWORD;
    const emailService = process.env.EMAIL_SERVICE;
    
    if (!emailUser || !emailPass || !emailService) {
      console.error('Email configuration is incomplete:', { 
        hasUser: !!emailUser, 
        hasPass: !!emailPass, 
        hasService: !!emailService 
      });
      return false;
    }
    
    // Create a transporter
    const transporter = nodemailer.createTransport({
      service: emailService,
      auth: {
        user: emailUser,
        pass: emailPass, // Using App Password instead of regular password
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_FROM || emailUser,
      to: email,
      subject: 'Your Authentication Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333;">Verification Code</h2>
          <p style="font-size: 16px; color: #666;">Your verification code is:</p>
          <div style="background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold; margin: 20px 0;">
            ${otp}
          </div>
          <p style="font-size: 14px; color: #999;">This code will expire in 5 minutes.</p>
          <p style="font-size: 14px; color: #999;">If you didn't request this code, please ignore this email.</p>
        </div>
      `,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return false;
  }
};

export default {
  generateOTP,
  verifyOTP,
  sendOTPByEmail,
}; 