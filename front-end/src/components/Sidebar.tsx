import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  Car, 
  Wallet, 
  History, 
  Settings,
  LogOut
} from 'lucide-react';
import { useAuth } from '../utils/AuthContext';

import icon from '../assets/icon.jpg';

const Sidebar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: Car, label: 'Book a Ride', path: '/book' },
    { icon: Wallet, label: 'Wallet', path: '/wallet' },
    { icon: History, label: 'Trip History', path: '/history' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Animation variants for nav items (container)
  const navItemVariants = {
    hover: { 
      x: 5,
      transition: { type: 'spring', stiffness: 300 },
    },
    active: { 
      scale: 1.02,
      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
      transition: { type: 'spring', stiffness: 300, duration: 0.3 },
    },
    inactive: {
      scale: 1,
      boxShadow: '0px 0px 0px rgba(0, 0, 0, 0)',
      transition: { duration: 0.2 },
    }
  };

  // Animation variants for text reveal
  const textVariants = {
    hidden: { 
      x: -20, 
      opacity: 0 
    },
    visible: (i: number) => ({
      x: 0,
      opacity: 1,
      transition: { 
        delay: i * 0.1, // Staggered reveal for each item
        type: 'spring', 
        stiffness: 300,
        damping: 20 
      }
    }),
    hover: {
      x: 5,
      transition: { type: 'spring', stiffness: 300 }
    }
  };

  // Animation variants for logout button
  const logoutVariants = {
    hover: { 
      x: 5,
      transition: { type: 'spring', stiffness: 300 },
    }
  };

  return (
    <motion.div
      className="w-64 h-screen bg-white border-r border-gray-200 shadow-md fixed left-0 top-0"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="p-6">
        <motion.h1
          className="text-2xl font-bold text-black mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Shuttlefy
        </motion.h1>
        <nav className="space-y-2">
          {navItems.map((item, index) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300
                ${isActive 
                  ? 'bg-black text-white' 
                  : 'text-black hover:bg-gray-100'}`
              }
            >
              {({ isActive }) => (
                <motion.div
                  variants={navItemVariants}
                  whileHover="hover"
                  animate={isActive ? 'active' : 'inactive'}
                  className="flex items-center space-x-3 w-full"
                >
                  <item.icon size={20} />
                  <motion.span
                    custom={index} // Pass index for staggered animation
                    variants={textVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                  >
                    {item.label}
                  </motion.span>
                </motion.div>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
      
      <div className="absolute bottom-0 w-full p-6">
        <motion.button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-black hover:bg-gray-100 transition-all duration-300"
          variants={logoutVariants}
          whileHover="hover"
          whileTap={{ scale: 0.98 }}
        >
          <LogOut size={20} className="text-gray-600" />
          <motion.span
            variants={textVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            custom={navItems.length} // Position after nav items in stagger sequence
          >
            Logout
          </motion.span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Sidebar;