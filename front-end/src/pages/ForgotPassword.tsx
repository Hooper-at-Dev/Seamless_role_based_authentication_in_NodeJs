import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';
import { authAPI } from '../utils/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.forgotPassword(email);
      setUserId(response.userId);
      setSuccess(true);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to request password reset. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    if (userId) {
      navigate(`/reset-password?userId=${userId}`);
    }
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
        <motion.button
          onClick={() => navigate('/login')}
          className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
          whileHover={{ x: -5 }}
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to login
        </motion.button>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">Reset Password</h1>
          <p className="text-gray-400 mt-2 text-sm font-medium">
            {!success 
              ? "Enter your email and we'll send you a verification code"
              : "Check your email for a verification code"
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
            <div className="relative group">
              <Mail className="absolute left-3 top-3 text-gray-500 group-focus-within:text-white transition-colors" size={20} />
              <input
                type="email"
                placeholder="Email Address"
                className="w-full pl-10 py-3 bg-zinc-800/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all text-white shadow-[0_4px_10px_-4px_rgba(255,255,255,0.1)]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                  <span>Send Reset Code</span>
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="bg-green-900/20 border border-green-800 p-4 rounded-lg text-green-200 text-sm">
              <p>A verification code has been sent to your email address. Please check your inbox and continue to set a new password.</p>
            </div>
            
            <motion.button
              onClick={handleContinue}
              className="w-full py-3 bg-white text-black rounded-xl hover:shadow-[0_8px_25px_-5px_rgba(255,255,255,0.3)] transition-all duration-300 font-medium shadow-[0_4px_15px_-3px_rgba(255,255,255,0.2)] flex justify-center items-center space-x-2"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>Continue</span>
              <ArrowRight size={18} />
            </motion.button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword; 