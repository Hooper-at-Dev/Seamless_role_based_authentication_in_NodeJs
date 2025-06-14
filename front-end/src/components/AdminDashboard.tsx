import React from 'react';
import { Route } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import AdminDashboardPage from '../pages/AdminDashboard';

// Create appropriate components with proper imports
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

const RoleRoute: React.FC<{ 
  children: React.ReactNode; 
  allowedRoles: ('user' | 'admin' | 'prime_admin')[] 
}> = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
};

// Fix the AdminDashboardRoute by removing the useEffect with undefined variables
const AdminDashboardRoute: React.FC = () => {
  const { isAuthenticated, user, token } = useAuth();
  
  console.log('Admin Dashboard Route:', {
    isAuthenticated,
    userRole: user?.role,
    hasToken: !!token
  });
  
  return (
    <Route
      path="/admin"
      element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['admin', 'prime_admin']}>
            <AdminDashboardPage />
          </RoleRoute>
        </ProtectedRoute>
      }
    />
  );
};

export default AdminDashboardRoute; 