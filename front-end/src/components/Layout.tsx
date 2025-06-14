import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import { Link } from 'react-router-dom';
import { Wallet as WalletIcon } from 'lucide-react';

const Layout = () => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <motion.main
        className="flex-1 p-8 ml-64"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Outlet />
      </motion.main>
    </div>
  );
};

export default Layout;