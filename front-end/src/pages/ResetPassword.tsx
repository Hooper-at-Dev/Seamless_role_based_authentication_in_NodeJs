import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, ArrowLeft, ArrowRight, AlertCircle, Check } from 'lucide-react';
import { authAPI } from '../utils/api';

const ResetPassword = () => {
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get userId from URL query params
    const params = new URLSearchParams(location.search);
    const id = params.get('userId');
    
    if (id) {
      setUserId(parseInt(id, 10));
    } else {
      setError('User ID is missing. Please go back and try again.');
    }
  }, [location]);

  const validateForm = () => {
    if (!otp) {
      setError('Please enter the verification code');
      return false;
    }
    
    if (!newPassword) {
      setError('Please enter a new password');
      return false;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      setError('User ID is missing. Please go back and try again.');
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await authAPI.resetPassword(userId, otp, newPassword);
      setSuccess(true);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to reset password. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturn = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black relative overflow-hidden">
      {/* Animated 3D patterns (similar to Login) */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-10">
          <div className="h-full w-full bg-grid-white/[0.2]" style={{ backgroundSize: '30px 30px' }}></div>
        </div>
        
        {/* Animated floating shapes */}
        <motion.div 
          className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full backdrop-blur-md border border-white/10"
          animate={{ 
            y: [0, 20, 0], 
            rotate: [0, 5, 0],
            scale: [1, 1.05, 1] 
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 8,
            ease: "easeInOut" 
          }}
        ></motion.div>
        
        <motion.div 
          className="absolute -bottom-40 -left-20 w-96 h-96 bg-white/5 rounded-full backdrop-blur-md border border-white/10"
          animate={{ 
            y: [0, -30, 0], 
            rotate: [0, -5, 0],
            scale: [1, 1.05, 1] 
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 10,
            ease: "easeInOut" 
          }}
        ></motion.div>
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/10"></div>
      </div>
      
      <motion.div
        className="bg-zinc-900/90 backdrop-blur-md p-10 w-full max-w-md rounded-2xl shadow-[0_20px_60px_-15px_rgba(255,255,255,0.1)] border border-white/10 z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {!success && (
          <motion.button
            onClick={() => navigate('/forgot-password')}
            className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
            whileHover={{ x: -5 }}
          >
            <ArrowLeft size={16} className="mr-2" />
            Back
          </motion.button>
        )}
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {success ? 'Password Reset Complete' : 'Set New Password'}
          </h1>
          <p className="text-gray-400 mt-2 text-sm font-medium">
            {success 
              ? "Your password has been successfully reset"
              : "Enter the verification code and your new password"
            }
          </p>
        </div>

        {error && (
          <motion.div 
            className="bg-red-900/20 border border-red-800 p-3 rounded-lg mb-6 text-red-200 text-sm flex items-start gap-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="otp" className="text-sm font-medium text-gray-300">
                Verification Code
              </label>
              <input
                id="otp"
                type="text"
                placeholder="Enter verification code"
                className="w-full px-4 py-3 bg-zinc-800/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all text-white"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-3 top-3 text-gray-500 group-focus-within:text-white transition-colors" size={20} />
              <input
                type="password"
                placeholder="New Password"
                className="w-full pl-10 py-3 bg-zinc-800/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all text-white shadow-[0_4px_10px_-4px_rgba(255,255,255,0.1)]"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-3 top-3 text-gray-500 group-focus-within:text-white transition-colors" size={20} />
              <input
                type="password"
                placeholder="Confirm New Password"
                className="w-full pl-10 py-3 bg-zinc-800/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all text-white shadow-[0_4px_10px_-4px_rgba(255,255,255,0.1)]"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <motion.button
              type="submit"
              className="w-full py-3 bg-white text-black rounded-xl hover:shadow-[0_8px_25px_-5px_rgba(255,255,255,0.3)] transition-all duration-300 font-medium shadow-[0_4px_15px_-3px_rgba(255,255,255,0.2)] flex justify-center items-center space-x-2"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
            >
              {isLoading ? (
                <span>Please wait...</span>
              ) : (
                <>
                  <span>Reset Password</span>
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="bg-green-900/20 border border-green-800 p-4 rounded-lg text-green-200 text-sm flex items-start gap-2">
              <Check size={18} className="shrink-0 mt-0.5" />
              <span>Your password has been reset successfully. You can now login with your new password.</span>
            </div>
            
            <motion.button
              onClick={handleReturn}
              className="w-full py-3 bg-white text-black rounded-xl hover:shadow-[0_8px_25px_-5px_rgba(255,255,255,0.3)] transition-all duration-300 font-medium shadow-[0_4px_15px_-3px_rgba(255,255,255,0.2)] flex justify-center items-center space-x-2"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>Return to Login</span>
              <ArrowRight size={18} />
            </motion.button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ResetPassword; 