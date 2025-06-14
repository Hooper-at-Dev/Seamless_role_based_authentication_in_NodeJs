// API base URL
const API_URL = 'http://localhost:8000/api';

// Types for auth responses
interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin' | 'prime_admin';
  isVerified: boolean;
}

interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

interface RegisterResponse {
  userId: number;
  role: string;
  message: string;
  testOtp?: string; // For development only
}

// Define DropoffLocation interface for type safety
export interface DropoffLocation {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

// Authentication API methods
export const authAPI = {
  // Register a new user
  async register(userData: { 
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<RegisterResponse> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }

    return response.json();
  },

  // Verify email with OTP
  async verifyEmail(userId: number, otp: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, otp }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Email verification failed');
    }

    return response.json();
  },

  // Login user
  async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    return response.json();
  },

  // DEPRECATED: Register as admin - This method is no longer supported for direct use
  // Use adminAPI.createAdmin instead which requires admin privileges
  async registerAdmin(): Promise<RegisterResponse> {
    console.warn('Direct admin registration is deprecated. Use adminAPI.createAdmin instead.');
    throw new Error('Direct admin registration is no longer supported');
  },

  // DEPRECATED: Register as prime admin - This method is no longer supported for direct use
  // Only the default prime admin (maggaacare@gmnail.com) should exist
  async registerPrimeAdmin(): Promise<RegisterResponse> {
    console.warn('Direct prime admin registration is deprecated and not allowed.');
    throw new Error('Direct prime admin registration is no longer supported');
  },

  // Request password reset
  async forgotPassword(email: string): Promise<{ userId: number; message: string }> {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Password reset request failed');
    }

    return response.json();
  },

  // Reset password with OTP
  async resetPassword(userId: number, otp: string, newPassword: string): Promise<{ message: string }> {
    const response = await fetch(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, otp, newPassword }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Password reset failed');
    }

    return response.json();
  },
};

// Admin API methods
export const adminAPI = {
  // Get all users (admin only)
  async getAllUsers(token: string): Promise<User[]> {
    // Check if token exists
    if (!token) {
      console.error('No token provided to getAllUsers');
      throw new Error('Authentication required');
    }
    
    console.log('Sending request with token:', token ? `${token.substring(0, 10)}...` : 'none');
    
    const response = await fetch(`${API_URL}/admin/users`, {
      method: 'GET',
      headers: {
        // Make sure the "Authorization" header is exactly formatted as the backend expects
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
      console.error('API error response:', response.status, errorData);
      throw new Error(errorData.message || 'Failed to get users');
    }

    return response.json();
  },

  // Get all admins (prime admin only)
  async getAllAdmins(token: string): Promise<User[]> {
    const response = await fetch(`${API_URL}/admin/admins`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get admins');
    }

    return response.json();
  },

  // Create a new admin (prime admin only)
  async createAdmin(token: string, userData: { 
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<{ admin: User; message: string }> {
    const response = await fetch(`${API_URL}/admin/admins`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create admin');
    }

    return response.json();
  },

  // Change user role (prime admin only)
  async changeUserRole(token: string, userId: number, role: 'user' | 'admin'): Promise<{ user: User; message: string }> {
    const response = await fetch(`${API_URL}/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to change user role');
    }

    return response.json();
  },

  // Delete user (prime admin only for admin users)
  async deleteUser(token: string, userId: number): Promise<{ message: string }> {
    const response = await fetch(`${API_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete user');
    }

    return response.json();
  },
};

// Location API methods
export const locationAPI = {
  // Get all dropoff locations
  async getDropoffLocations(token: string): Promise<DropoffLocation[]> {
    const response = await fetch(`${API_URL}/locations/dropoff-locations`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get dropoff locations');
    }

    return response.json();
  },

  // Add a new dropoff location
  async addDropoffLocation(token: string, locationData: Omit<DropoffLocation, 'id'>): Promise<DropoffLocation> {
    const response = await fetch(`${API_URL}/locations/dropoff-locations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(locationData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add dropoff location');
    }

    return response.json();
  },

  // Update an existing dropoff location
  async updateDropoffLocation(token: string, id: number, locationData: Partial<Omit<DropoffLocation, 'id'>>): Promise<DropoffLocation> {
    const response = await fetch(`${API_URL}/locations/dropoff-locations/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(locationData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update dropoff location');
    }

    return response.json();
  },

  // Delete a dropoff location
  async deleteDropoffLocation(token: string, id: number): Promise<{ message: string }> {
    const response = await fetch(`${API_URL}/locations/dropoff-locations/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete dropoff location');
    }

    return response.json();
  },
};