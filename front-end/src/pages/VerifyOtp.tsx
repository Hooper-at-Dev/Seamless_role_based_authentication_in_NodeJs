import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../utils/AuthContext';
import { ShieldCheck } from 'lucide-react';

const VerifyOtp = () => {
  const [otp, setOtp] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { verifyEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get userId from URL search params or state
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('userId');
    
    if (id) {
      setUserId(parseInt(id, 10));
    } else if (location.state?.userId) {
      setUserId(location.state.userId);
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!userId) {
      setError('User ID is missing. Please go back to the registration page.');
      return;
    }
    
    if (!otp || otp.length < 4) {
      setError('Please enter a valid verification code.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await verifyEmail(userId, otp);
      navigate('/'); // Redirect to dashboard on success
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to verify email. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-black text-white">
        <div className="bg-zinc-900/90 backdrop-blur-md p-6 rounded-xl border border-white/10">
          <h2 className="text-xl font-semibold mb-4">Verification Error</h2>
          <p className="text-gray-400">No user ID provided. Please go back and try again.</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 w-full py-2 bg-white text-black rounded-lg font-medium"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black relative overflow-hidden">
      {/* Animated 3D patterns (same as in Login component) */}
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
        <div className="text-center mb-8">
          <motion.div
            className="inline-block p-4 rounded-full bg-gradient-to-tr from-gray-700 to-gray-900 mb-5 shadow-[0_10px_20px_-10px_rgba(255,255,255,0.2)] border border-white/10"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
          >
            <ShieldCheck size={35} className="text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Verify Your Email</h1>
          <p className="text-gray-400 mt-2 text-sm font-medium">Enter the verification code sent to your email</p>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-800 p-3 rounded-lg mb-6 text-red-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="otp" className="text-sm font-medium text-gray-300">
              Verification Code
            </label>
            <input
              id="otp"
              type="text"
              placeholder="Enter 6-digit code"
              className="w-full px-4 py-3 bg-zinc-800/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all text-white"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>

          <motion.button
            type="submit"
            className="w-full py-3 bg-white text-black rounded-xl hover:shadow-[0_8px_25px_-5px_rgba(255,255,255,0.3)] transition-all duration-300 font-medium shadow-[0_4px_15px_-3px_rgba(255,255,255,0.2)]"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading}
          >
            {isLoading ? 'Verifying...' : 'Verify'}
          </motion.button>
        </form>

        <p className="text-center mt-5 text-gray-500">
          <button 
            onClick={() => navigate('/login')}
            className="text-gray-300 hover:text-white transition-colors font-medium"
          >
            Back to login
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default VerifyOtp; 