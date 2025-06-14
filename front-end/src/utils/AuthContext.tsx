import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from './api';

// Types for auth context
interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin' | 'prime_admin';
  credits: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { email: string; password: string; firstName: string; lastName: string }) => Promise<number>;
  verifyEmail: (userId: number, otp: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  token: null,
  login: async () => {},
  register: async () => 0,
  verifyEmail: async () => {},
  logout: () => {},
  loading: false,
  error: null,
  clearError: () => {},
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in (on first load)
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
    
    setLoading(false);
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.login({ email, password });
      
      // Save auth data
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      console.log('Login successful', { 
        tokenExists: !!response.token,
        userRole: response.user.role,
        tokenFirstChars: response.token ? response.token.substring(0, 10) + '...' : 'none'
      });
      
      setToken(response.token);
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData: { email: string; password: string; firstName: string; lastName: string }) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.register(userData);
      return response.userId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Verify email function
  const verifyEmail = async (userId: number, otp: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.verifyEmail(userId, otp);
      
      // Save auth data
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('userRole', response.user.role); // For backward compatibility
      
      setToken(response.token);
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Email verification failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        token,
        login,
        register,
        verifyEmail,
        logout,
        loading,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 