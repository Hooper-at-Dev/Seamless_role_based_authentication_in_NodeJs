import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Car, Mail, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../utils/AuthContext';
import { authAPI } from '../utils/api';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect based on role
      if (user.role === 'admin' || user.role === 'prime_admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const validateEmail = (email: string): boolean => {
    if (!email.toLowerCase().endsWith('@bennett.edu.in')) {
      setError('Please use your university email address ending with @bennett.edu.in');
      return false;
    }
    return true;
  };

  const validateForm = () => {
    if (!email || !password) {
      setError('Email and password are required');
      return false;
    }

    if (!isLogin) {
      if (!validateEmail(email)) {
        return false;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return false;
      }

      if (!firstName || !firstName.trim() || !lastName || !lastName.trim()) {
        setError('First name and last name are required');
        return false;
      }
    }

    return true;
  };

  const handleLogin = async () => {
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      // Redirect will happen in the useEffect
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Login failed. Please check your credentials and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    setError(null);
    setIsLoading(true);

    const userData = {
      email,
      password,
      firstName,
      lastName
    };

    try {
      // Only regular user registration is allowed through frontend
      const response = await authAPI.register(userData);

      // Navigate to OTP verification page with userId only, no testOtp
      navigate(`/verify-otp?userId=${response.userId}`);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (isLogin) {
      await handleLogin();
    } else {
      await handleRegister();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black relative overflow-hidden">
      {/* Animated 3D patterns */}
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
        
        <motion.div 
          className="absolute top-1/3 left-1/4 w-60 h-60 bg-white/5 rounded-2xl backdrop-blur-md border border-white/10 rotate-12"
          animate={{ 
            y: [0, 15, 0], 
            rotate: [12, 17, 12],
            scale: [1, 1.03, 1] 
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 7,
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
        {/* Glass effect overlay */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-20"></div>
        </div>
        
        <div className="relative z-10">
          <div className="text-center mb-8">
            <motion.div
              className="inline-block p-4 rounded-full bg-gradient-to-tr from-gray-700 to-gray-900 mb-5 shadow-[0_10px_20px_-10px_rgba(255,255,255,0.2)] border border-white/10"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
            >
              <Car size={35} className="text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white tracking-tight">CyberCab</h1>
            <p className="text-gray-400 mt-2 text-sm font-medium">The future of urban mobility</p>
          </div>

          {/* Login/Register Toggle */}
          <div className="flex justify-center mb-6">
            <div className="flex space-x-1 bg-zinc-800/80 rounded-xl p-1 shadow-inner border border-white/5">
              <button
                className={`px-5 py-2 rounded-lg transition-all duration-300 font-medium ${
                  isLogin ? 'bg-white text-black shadow-[0_5px_15px_-5px_rgba(255,255,255,0.3)]' : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setIsLogin(true)}
                type="button"
              >
                Login
              </button>
              <button
                className={`px-5 py-2 rounded-lg transition-all duration-300 font-medium ${
                  !isLogin ? 'bg-white text-black shadow-[0_5px_15px_-5px_rgba(255,255,255,0.3)]' : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setIsLogin(false)}
                type="button"
              >
                Register
              </button>
            </div>
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

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email input - show for both login and registration */}
            <div className="relative group">
              <Mail className="absolute left-3 top-3 text-gray-500 group-focus-within:text-white transition-colors" size={20} />
              <input
                type="email"
                placeholder={isLogin ? "Email Address" : "example@bennett.edu.in"}
                className="w-full pl-10 py-3 bg-zinc-800/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="relative group">
              <Lock className="absolute left-3 top-3 text-gray-500 group-focus-within:text-white transition-colors" size={20} />
              <input
                type="password"
                placeholder="Password"
                className="w-full pl-10 py-3 bg-zinc-800/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all text-white shadow-[0_4px_10px_-4px_rgba(255,255,255,0.1)]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {!isLogin && (
              <>
                <div className="relative group">
                  <Lock className="absolute left-3 top-3 text-gray-500 group-focus-within:text-white transition-colors" size={20} />
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    className="w-full pl-10 py-3 bg-zinc-800/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all text-white shadow-[0_4px_10px_-4px_rgba(255,255,255,0.1)]"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <div className="relative group flex-1">
                    <User className="absolute left-3 top-3 text-gray-500 group-focus-within:text-white transition-colors" size={20} />
                    <input
                      type="text"
                      placeholder="First Name"
                      className="w-full pl-10 py-3 bg-zinc-800/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all text-white"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="relative group flex-1">
                    <User className="absolute left-3 top-3 text-gray-500 group-focus-within:text-white transition-colors" size={20} />
                    <input
                      type="text"
                      placeholder="Last Name"
                      className="w-full pl-10 py-3 bg-zinc-800/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all text-white"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {isLogin ? (
              <div className="text-xs text-gray-500 mt-2">
                Regular users must use university email addresses ending with @bennett.edu.in
              </div>
            ) : (
              <div className="text-xs text-gray-500 mt-2">
                Please use your university email address ending with @bennett.edu.in
              </div>
            )}

            <motion.button
              type="submit"
              className="w-full py-3 bg-white text-black rounded-xl hover:shadow-[0_8px_25px_-5px_rgba(255,255,255,0.3)] transition-all duration-300 font-medium mt-2 shadow-[0_4px_15px_-3px_rgba(255,255,255,0.2)] flex justify-center items-center space-x-2"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
            >
              {isLoading ? (
                <span>Please wait...</span>
              ) : (
                <>
                  <span>
                    {isLogin ? 'Login' : 'Create Account'}
                  </span>
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </form>

          {isLogin && (
            <p className="text-center mt-5 text-gray-500">
              <button 
                onClick={() => navigate('/forgot-password')}
                className="text-gray-300 hover:text-white hover:underline transition-colors font-medium"
              >
                Forgot password?
              </button>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Login;