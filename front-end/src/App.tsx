import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import BookingInterface from './pages/BookingInterface';
import Wallet from './pages/Wallet';
import TripHistory from './pages/TripHistory';
import Profile from './pages/Profile';
import Layout from './components/Layout';
import { AuthProvider, useAuth } from './utils/AuthContext';
import VerifyOtp from './pages/VerifyOtp';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Protected route that checks if user is authenticated
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  // Show loading state while checking authentication
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Role-specific route component
const RoleRoute: React.FC<{ 
  children: React.ReactNode; 
  allowedRoles: ('user' | 'admin' | 'prime_admin')[] 
}> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();
  
  // Make sure we're checking authentication first
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  
  // Debug the role check
  console.log('User role:', user.role, 'Allowed roles:', allowedRoles);
  
  // Fix: Ensure the role check is working correctly
  if (!allowedRoles.includes(user.role)) {
    // If this triggers incorrectly, it would explain the UI showing "unauthorized"
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['admin', 'prime_admin']}>
                    <AdminDashboard />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />
            
            {/* User routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="book" element={<BookingInterface />} />
              <Route path="wallet" element={<Wallet />} />
              <Route path="history" element={<TripHistory />} />
              <Route path="settings" element={<Profile />} />
            </Route>
          </Routes>
        </AnimatePresence>
      </Router>
    </AuthProvider>
  );
}

export default App;