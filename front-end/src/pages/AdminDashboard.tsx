import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Users, MapPin, BookOpen, DollarSign, Search, LogOut, ShieldCheck, Plus, X, Mail, User, Lock, AlertCircle, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../utils/AuthContext';
import { adminAPI } from '../utils/api';
import { locationAPI } from '../utils/api';

const mockRevenueData = [
  { date: 'Jan', revenue: 12500 },
  { date: 'Feb', revenue: 15000 },
  { date: 'Mar', revenue: 18000 },
  { date: 'Apr', revenue: 16500 },
  { date: 'May', revenue: 21000 },
  { date: 'Jun', revenue: 19500 },
];

// Removed mockUsers since we'll fetch real users

const mockRoutes = [
  { id: 1, name: 'Campus Loop', stops: 5, activeDrivers: 3 },
  { id: 2, name: 'Downtown Express', stops: 8, activeDrivers: 4 },
  { id: 3, name: 'Library Shuttle', stops: 3, activeDrivers: 2 },
];

// Define User interface to match backend
interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin' | 'prime_admin';
  isVerified: boolean;
  createdAt?: string;
  trips?: number; // Optional as it might not be in the API response
  status?: string; // Optional as it might not be in the API response
}

// Define DropoffLocation interface
interface DropoffLocation {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);
  const [totalUserCount, setTotalUserCount] = useState(0);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [deletingUser, setDeletingUser] = useState(false);
  const [showChangeRoleModal, setShowChangeRoleModal] = useState(false);
  const [changingRole, setChangingRole] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'user' | 'admin'>('user');
  const [dropoffLocations, setDropoffLocations] = useState<DropoffLocation[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  // State for location modals
  const [showAddLocationModal, setShowAddLocationModal] = useState(false);
  const [showEditLocationModal, setShowEditLocationModal] = useState(false);
  const [showDeleteLocationModal, setShowDeleteLocationModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<DropoffLocation | null>(null);
  const [locationName, setLocationName] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [locationLatitude, setLocationLatitude] = useState<number | ''>('');
  const [locationLongitude, setLocationLongitude] = useState<number | ''>('');
  const [processingLocation, setProcessingLocation] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { user, logout, token } = useAuth();
  
  // Check if the current user is a prime admin
  const isPrimeAdmin = user?.role === 'prime_admin';

  // Add debugging to verify the role
  console.log('Current user role:', user?.role);
  console.log('Token exists:', !!token);

  // Function to fetch users from the backend - wrapped in useCallback
  const fetchUsers = useCallback(async () => {
    if (!token) {
      console.error('No auth token available');
      setError('Authentication required');
      return;
    }
    
    setLoadingUsers(true);
    setUserError(null);
    
    try {
      console.log('Fetching users with token:', token ? `${token.substring(0, 10)}...` : 'none');
      const fetchedUsers = await adminAPI.getAllUsers(token);
      setUsers(fetchedUsers);
      setTotalUserCount(fetchedUsers.length);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setUserError(err instanceof Error ? err.message : 'Failed to load users');
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  }, [token]);

  // Function to fetch dropoff locations - wrapped in useCallback
  const fetchDropoffLocations = useCallback(async () => {
    setLoadingLocations(true);
    setLocationError(null);
    
    try {
      const locations = await locationAPI.getDropoffLocations(token || '');
      setDropoffLocations(locations);
    } catch (err) {
      console.error('Failed to fetch dropoff locations:', err);
      setLocationError(err instanceof Error ? err.message : 'Failed to load dropoff locations');
      setDropoffLocations([]);
    } finally {
      setLoadingLocations(false);
    }
  }, [token]);

  // Fetch users when the dashboard loads or when the tab changes to 'users'
  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
    
    if (activeTab === 'routes') {
      fetchDropoffLocations();
    }
  }, [activeTab, fetchUsers, fetchDropoffLocations]);

  useEffect(() => {
    // Reset form and messages when modal is closed
    if (!showCreateAdminModal) {
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setError(null);
      setSuccessMessage(null);
    }
  }, [showCreateAdminModal]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const userData = {
        email,
        password,
        firstName,
        lastName,
      };
      
      // Get the token from the auth context
      if (!user || user.role !== 'prime_admin') {
        setError('You are not authorized to perform this action');
        setIsLoading(false);
        return;
      }
      
      // Create admin account using the token from auth context
      await adminAPI.createAdmin(token || '', userData);
      
      setSuccessMessage('Admin account created successfully');
      
      // Clear form after success
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      
      // Close modal after 2 seconds
      setTimeout(() => {
        setShowCreateAdminModal(false);
        setSuccessMessage(null);
      }, 2000);
      
      // Refresh user list if we're on the users tab
      if (activeTab === 'users') {
        fetchUsers();
      }
      
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to create admin account');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Get filtered users based on search term
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { icon: Users, label: 'Total Users', value: totalUserCount.toString(), color: 'black' },
    { icon: BookOpen, label: 'Active Bookings', value: '56', color: 'black' },
    { icon: MapPin, label: 'Active Routes', value: '8', color: 'black' },
    { icon: DollarSign, label: 'Revenue', value: '$21,000', color: 'black' },
  ];

  const handleDeleteUser = async (userId: number) => {
    if (!token || !isPrimeAdmin) return;
    
    setDeletingUser(true);
    try {
      await adminAPI.deleteUser(token, userId);
      setShowConfirmDeleteModal(false);
      setSelectedUser(null);
      
      // Refresh user list
      fetchUsers();
      
      // Show a success message
      setSuccessMessage('User deleted successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
      setTimeout(() => setError(null), 3000);
    } finally {
      setDeletingUser(false);
    }
  };

  const handleChangeRole = async (userId: number, role: 'user' | 'admin') => {
    if (!token || !isPrimeAdmin) return;
    
    setChangingRole(true);
    try {
      await adminAPI.changeUserRole(token, userId, role);
      setShowChangeRoleModal(false);
      setSelectedUser(null);
      
      // Refresh user list
      fetchUsers();
      
      // Show a success message
      setSuccessMessage(`User role changed to ${role}`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change user role');
      setTimeout(() => setError(null), 3000);
    } finally {
      setChangingRole(false);
    }
  };

  // Function to handle adding a new location
  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessingLocation(true);
    setLocationError(null);
    setLocationSuccess(null);
    
    try {
      // Validate inputs
      if (!locationName || !locationAddress || locationLatitude === '' || locationLongitude === '') {
        throw new Error('All fields are required');
      }
      
      // Create location object
      const newLocation = {
        name: locationName,
        address: locationAddress,
        latitude: Number(locationLatitude),
        longitude: Number(locationLongitude)
      };
      
      // Call API to add location
      await locationAPI.addDropoffLocation(token || '', newLocation);
      
      // Reset form and show success message
      setLocationSuccess('Location added successfully');
      setLocationName('');
      setLocationAddress('');
      setLocationLatitude('');
      setLocationLongitude('');
      
      // Refresh locations list
      fetchDropoffLocations();
      
      // Close modal after a delay
      setTimeout(() => {
        setShowAddLocationModal(false);
        setLocationSuccess(null);
      }, 2000);
    } catch (err) {
      console.error('Failed to add location:', err);
      setLocationError(err instanceof Error ? err.message : 'Failed to add location');
    } finally {
      setProcessingLocation(false);
    }
  };
  
  // Function to handle editing a location
  const handleEditLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessingLocation(true);
    setLocationError(null);
    setLocationSuccess(null);
    
    try {
      if (!selectedLocation) {
        throw new Error('No location selected for editing');
      }
      
      // Validate inputs
      if (!locationName || !locationAddress || locationLatitude === '' || locationLongitude === '') {
        throw new Error('All fields are required');
      }
      
      // Create updated location object
      const updatedLocation = {
        name: locationName,
        address: locationAddress,
        latitude: Number(locationLatitude),
        longitude: Number(locationLongitude)
      };
      
      // Call API to update location
      await locationAPI.updateDropoffLocation(token || '', selectedLocation.id, updatedLocation);
      
      // Show success message
      setLocationSuccess('Location updated successfully');
      
      // Refresh locations list
      fetchDropoffLocations();
      
      // Close modal after a delay
      setTimeout(() => {
        setShowEditLocationModal(false);
        setLocationSuccess(null);
      }, 2000);
    } catch (err) {
      console.error('Failed to update location:', err);
      setLocationError(err instanceof Error ? err.message : 'Failed to update location');
    } finally {
      setProcessingLocation(false);
    }
  };
  
  // Function to handle deleting a location
  const handleDeleteLocation = async () => {
    setProcessingLocation(true);
    setLocationError(null);
    
    try {
      if (!selectedLocation) {
        throw new Error('No location selected for deletion');
      }
      
      // Call API to delete location
      await locationAPI.deleteDropoffLocation(token || '', selectedLocation.id);
      
      // Refresh locations list
      fetchDropoffLocations();
      
      // Close modal
      setShowDeleteLocationModal(false);
    } catch (err) {
      console.error('Failed to delete location:', err);
      setLocationError(err instanceof Error ? err.message : 'Failed to delete location');
    } finally {
      setProcessingLocation(false);
    }
  };
  
  // Function to open the edit location modal
  const openEditLocationModal = (location: DropoffLocation) => {
    setSelectedLocation(location);
    setLocationName(location.name);
    setLocationAddress(location.address);
    setLocationLatitude(location.latitude);
    setLocationLongitude(location.longitude);
    setShowEditLocationModal(true);
  };
  
  // Function to open the delete location modal
  const openDeleteLocationModal = (location: DropoffLocation) => {
    setSelectedLocation(location);
    setShowDeleteLocationModal(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6 bg-white p-6"
    >
      {/* Success/Error Message Toast */}
      {(successMessage || error) && (
        <motion.div 
          className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-md ${
            successMessage ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
          }`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div className="flex items-start gap-3">
            {successMessage ? (
              <ShieldCheck size={20} className="text-green-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
            )}
            <span>{successMessage || error}</span>
          </div>
        </motion.div>
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-black">Admin Dashboard</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600" size={20} />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 p-2 border border-gray-300 rounded-lg text-black bg-white focus:outline-none focus:border-black"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          {isPrimeAdmin && (
            <button
              className="bg-black text-white px-3 py-1 rounded-lg hover:bg-gray-800 transition-colors text-sm flex items-center gap-2"
              onClick={() => setShowCreateAdminModal(true)}
            >
              <Plus size={16} />
              <span>Create Admin</span>
            </button>
          )}
          <button
            className="bg-gray-200 text-gray-600 px-3 py-1 rounded-lg hover:bg-gray-300 transition-colors text-sm flex items-center gap-2"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            className="border border-gray-300 p-6 bg-white shadow-md rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="text-black mb-4">
              <stat.icon size={24} />
            </div>
            <p className="text-gray-600">{stat.label}</p>
            <p className="text-2xl font-bold text-black">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="flex space-x-4 mb-6">
        {['overview', 'users', 'routes', 'bookings'].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-lg transition-all duration-300 ${
              activeTab === tab
                ? 'bg-black text-white'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <motion.div
          className="border border-gray-300 p-6 bg-white shadow-md rounded-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-bold text-black mb-4">Revenue Overview</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockRevenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    color: '#000',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#000"
                  strokeWidth={2}
                  dot={{ fill: '#000' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {activeTab === 'users' && (
        <motion.div
          className="border border-gray-300 p-6 bg-white shadow-md rounded-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {loadingUsers ? (
            <div className="flex justify-center items-center p-12">
              <Loader className="animate-spin text-gray-500" size={36} />
              <span className="ml-2 text-gray-500">Loading users...</span>
            </div>
          ) : userError ? (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-red-800 flex items-center justify-center">
              <AlertCircle size={20} className="mr-2" />
              <span>{userError}</span>
              <button 
                className="ml-4 underline text-black hover:text-gray-700"
                onClick={fetchUsers}
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {filteredUsers.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="text-left py-3 px-4 text-black">Name</th>
                      <th className="text-left py-3 px-4 text-black">Email</th>
                      <th className="text-left py-3 px-4 text-black">Role</th>
                      <th className="text-left py-3 px-4 text-black">Verified</th>
                      <th className="text-left py-3 px-4 text-black">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((userItem) => (
                      <tr key={userItem.id} className="border-b border-gray-200">
                        <td className="py-3 px-4 text-black">{`${userItem.firstName} ${userItem.lastName}`}</td>
                        <td className="py-3 px-4 text-black">{userItem.email}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              userItem.role === 'prime_admin'
                                ? 'bg-black text-white'
                                : userItem.role === 'admin'
                                ? 'bg-gray-800 text-white'
                                : 'bg-gray-200 text-gray-800'
                            }`}
                          >
                            {userItem.role === 'prime_admin' ? 'Prime Admin' : 
                             userItem.role === 'admin' ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              userItem.isVerified
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {userItem.isVerified ? 'Verified' : 'Unverified'}
                          </span>
                        </td>
                        <td className="py-3 px-4 flex space-x-2">
                          {isPrimeAdmin && userItem.role !== 'prime_admin' && (
                            <>
                              <button 
                                className="bg-gray-800 text-white px-3 py-1 rounded-lg hover:bg-black transition-colors text-sm"
                                onClick={() => {
                                  setSelectedUser(userItem);
                                  setSelectedRole(userItem.role === 'admin' ? 'user' : 'admin');
                                  setShowChangeRoleModal(true);
                                }}
                              >
                                {userItem.role === 'admin' ? 'Demote' : 'Promote'}
                              </button>
                              <button 
                                className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors text-sm"
                                onClick={() => {
                                  setSelectedUser(userItem);
                                  setShowConfirmDeleteModal(true);
                                }}
                              >
                                Delete
                              </button>
                            </>
                          )}
                          <button className="bg-black text-white px-3 py-1 rounded-lg hover:bg-gray-800 transition-colors text-sm">
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No users match your search.' : 'No users found in the database.'}
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}

      {activeTab === 'routes' && (
        <motion.div
          className="border border-gray-300 p-6 bg-white shadow-md rounded-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-black">Routes & Dropoff Locations</h2>
            <button 
              className="bg-black text-white px-3 py-1 rounded-lg hover:bg-gray-800 transition-colors text-sm flex items-center gap-2"
              onClick={() => setShowAddLocationModal(true)}
            >
              <Plus size={16} />
              <span>Add Location</span>
            </button>
          </div>
          
          <div className="overflow-x-auto">
            {loadingLocations ? (
              <div className="flex justify-center items-center p-12">
                <Loader className="animate-spin text-gray-500" size={36} />
                <span className="ml-2 text-gray-500">Loading locations...</span>
              </div>
            ) : locationError ? (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-red-800 flex items-center justify-center">
                <AlertCircle size={20} className="mr-2" />
                <span>{locationError}</span>
                <button 
                  className="ml-4 underline text-black hover:text-gray-700"
                  onClick={fetchDropoffLocations}
                >
                  Try Again
                </button>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left py-3 px-4 text-black">ID</th>
                    <th className="text-left py-3 px-4 text-black">Location Name</th>
                    <th className="text-left py-3 px-4 text-black">Address</th>
                    <th className="text-left py-3 px-4 text-black">Coordinates</th>
                    <th className="text-left py-3 px-4 text-black">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dropoffLocations.length > 0 ? (
                    dropoffLocations.map((location) => (
                      <tr key={location.id} className="border-b border-gray-200">
                        <td className="py-3 px-4 text-black">{location.id}</td>
                        <td className="py-3 px-4 text-black">{location.name}</td>
                        <td className="py-3 px-4 text-black">{location.address}</td>
                        <td className="py-3 px-4 text-black">
                          {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                        </td>
                        <td className="py-3 px-4 flex space-x-2">
                          <button 
                            className="bg-black text-white px-3 py-1 rounded-lg hover:bg-gray-800 transition-colors text-sm"
                            onClick={() => openEditLocationModal(location)}
                          >
                            Edit
                          </button>
                          <button 
                            className="bg-gray-200 text-gray-600 px-3 py-1 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                            onClick={() => openDeleteLocationModal(location)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-500">
                        No dropoff locations found. Add some locations to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      )}

      {activeTab === 'bookings' && (
        <motion.div
          className="border border-gray-300 p-6 bg-white shadow-md rounded-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-gray-600">Booking management interface coming soon...</p>
        </motion.div>
      )}

      {/* Create Admin Modal */}
      {showCreateAdminModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
              onClick={() => setShowCreateAdminModal(false)}
            >
              <X size={20} />
            </button>
            
            <div className="mb-6 flex items-center gap-3">
              <div className="bg-gray-200 p-2 rounded-full">
                <ShieldCheck size={24} className="text-gray-700" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Create Admin Account</h2>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-lg mb-6 text-red-800 text-sm flex items-start gap-2">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            
            {successMessage && (
              <div className="bg-green-50 border border-green-200 p-3 rounded-lg mb-6 text-green-800 text-sm flex items-start gap-2">
                <ShieldCheck size={18} className="shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}
            
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-gray-700 text-sm font-medium mb-1">First Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 text-gray-500" size={18} />
                    <input
                      type="text"
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-gray-700 text-sm font-medium mb-1">Last Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 text-gray-500" size={18} />
                    <input
                      type="text"
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 text-gray-500" size={18} />
                  <input
                    type="email"
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 text-gray-500" size={18} />
                  <input
                    type="password"
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 text-gray-500" size={18} />
                  <input
                    type="password"
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex justify-center items-center gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span>Creating...</span>
                  ) : (
                    <>
                      <ShieldCheck size={18} />
                      <span>Create Admin Account</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {showConfirmDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
              onClick={() => setShowConfirmDeleteModal(false)}
            >
              <X size={20} />
            </button>
            
            <div className="mb-6 flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-full">
                <AlertCircle size={24} className="text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Confirm Deletion</h2>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete the user <span className="font-semibold">{selectedUser.email}</span>? This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => setShowConfirmDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                onClick={() => handleDeleteUser(selectedUser.id)}
                disabled={deletingUser}
              >
                {deletingUser ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete User</span>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Change Role Modal */}
      {showChangeRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
              onClick={() => setShowChangeRoleModal(false)}
            >
              <X size={20} />
            </button>
            
            <div className="mb-6 flex items-center gap-3">
              <div className="bg-gray-200 p-2 rounded-full">
                <ShieldCheck size={24} className="text-gray-700" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Change User Role</h2>
            </div>
            
            <p className="text-gray-700 mb-4">
              Change the role of <span className="font-semibold">{selectedUser.email}</span> from <span className="font-semibold">{selectedUser.role}</span> to:
            </p>
            
            <div className="flex justify-center mb-6">
              <div className="flex space-x-1 bg-gray-100 rounded-xl p-1 shadow-inner border border-gray-200">
                <button
                  className={`px-5 py-2 rounded-lg transition-all duration-300 font-medium ${
                    selectedRole === 'user' ? 'bg-white text-black shadow-md' : 'text-gray-600 hover:text-black'
                  }`}
                  onClick={() => setSelectedRole('user')}
                  type="button"
                >
                  User
                </button>
                <button
                  className={`px-5 py-2 rounded-lg transition-all duration-300 font-medium ${
                    selectedRole === 'admin' ? 'bg-white text-black shadow-md' : 'text-gray-600 hover:text-black'
                  }`}
                  onClick={() => setSelectedRole('admin')}
                  type="button"
                >
                  Admin
                </button>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => setShowChangeRoleModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
                onClick={() => handleChangeRole(selectedUser.id, selectedRole)}
                disabled={changingRole}
              >
                {changingRole ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <span>Update Role</span>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Add Location Modal */}
      {showAddLocationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
              onClick={() => setShowAddLocationModal(false)}
              disabled={processingLocation}
            >
              <X size={20} />
            </button>
            
            <div className="mb-6 flex items-center gap-3">
              <div className="bg-gray-200 p-2 rounded-full">
                <MapPin size={24} className="text-gray-700" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Add Dropoff Location</h2>
            </div>
            
            {locationError && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-lg mb-6 text-red-800 text-sm flex items-start gap-2">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{locationError}</span>
              </div>
            )}
            
            {locationSuccess && (
              <div className="bg-green-50 border border-green-200 p-3 rounded-lg mb-6 text-green-800 text-sm flex items-start gap-2">
                <span>{locationSuccess}</span>
              </div>
            )}
            
            <form onSubmit={handleAddLocation}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="locationName" className="block text-sm font-medium text-gray-700 mb-1">
                    Location Name
                  </label>
                  <input
                    id="locationName"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    disabled={processingLocation}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="locationAddress" className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    id="locationAddress"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    value={locationAddress}
                    onChange={(e) => setLocationAddress(e.target.value)}
                    disabled={processingLocation}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="locationLatitude" className="block text-sm font-medium text-gray-700 mb-1">
                      Latitude
                    </label>
                    <input
                      id="locationLatitude"
                      type="number"
                      step="0.0001"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                      value={locationLatitude}
                      onChange={(e) => setLocationLatitude(e.target.value === '' ? '' : Number(e.target.value))}
                      disabled={processingLocation}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="locationLongitude" className="block text-sm font-medium text-gray-700 mb-1">
                      Longitude
                    </label>
                    <input
                      id="locationLongitude"
                      type="number"
                      step="0.0001"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                      value={locationLongitude}
                      onChange={(e) => setLocationLongitude(e.target.value === '' ? '' : Number(e.target.value))}
                      disabled={processingLocation}
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-black text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                  disabled={processingLocation}
                >
                  {processingLocation ? (
                    <span className="flex items-center justify-center">
                      <Loader size={16} className="animate-spin mr-2" />
                      Adding...
                    </span>
                  ) : (
                    'Add Location'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      
      {/* Edit Location Modal */}
      {showEditLocationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
              onClick={() => setShowEditLocationModal(false)}
              disabled={processingLocation}
            >
              <X size={20} />
            </button>
            
            <div className="mb-6 flex items-center gap-3">
              <div className="bg-gray-200 p-2 rounded-full">
                <MapPin size={24} className="text-gray-700" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Edit Dropoff Location</h2>
            </div>
            
            {locationError && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-lg mb-6 text-red-800 text-sm flex items-start gap-2">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{locationError}</span>
              </div>
            )}
            
            {locationSuccess && (
              <div className="bg-green-50 border border-green-200 p-3 rounded-lg mb-6 text-green-800 text-sm flex items-start gap-2">
                <span>{locationSuccess}</span>
              </div>
            )}
            
            <form onSubmit={handleEditLocation}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="editLocationName" className="block text-sm font-medium text-gray-700 mb-1">
                    Location Name
                  </label>
                  <input
                    id="editLocationName"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    disabled={processingLocation}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="editLocationAddress" className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    id="editLocationAddress"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    value={locationAddress}
                    onChange={(e) => setLocationAddress(e.target.value)}
                    disabled={processingLocation}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="editLocationLatitude" className="block text-sm font-medium text-gray-700 mb-1">
                      Latitude
                    </label>
                    <input
                      id="editLocationLatitude"
                      type="number"
                      step="0.0001"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                      value={locationLatitude}
                      onChange={(e) => setLocationLatitude(e.target.value === '' ? '' : Number(e.target.value))}
                      disabled={processingLocation}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="editLocationLongitude" className="block text-sm font-medium text-gray-700 mb-1">
                      Longitude
                    </label>
                    <input
                      id="editLocationLongitude"
                      type="number"
                      step="0.0001"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                      value={locationLongitude}
                      onChange={(e) => setLocationLongitude(e.target.value === '' ? '' : Number(e.target.value))}
                      disabled={processingLocation}
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-black text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                  disabled={processingLocation}
                >
                  {processingLocation ? (
                    <span className="flex items-center justify-center">
                      <Loader size={16} className="animate-spin mr-2" />
                      Updating...
                    </span>
                  ) : (
                    'Update Location'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      
      {/* Delete Location Confirmation Modal */}
      {showDeleteLocationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
              onClick={() => setShowDeleteLocationModal(false)}
              disabled={processingLocation}
            >
              <X size={20} />
            </button>
            
            <div className="mb-6 flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-full">
                <AlertCircle size={24} className="text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Confirm Deletion</h2>
            </div>
            
            {locationError && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-lg mb-6 text-red-800 text-sm flex items-start gap-2">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{locationError}</span>
              </div>
            )}
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the dropoff location "{selectedLocation?.name}"? This action cannot be undone.
            </p>
            
            <div className="flex space-x-4">
              <button
                className="flex-1 py-2 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                onClick={() => setShowDeleteLocationModal(false)}
                disabled={processingLocation}
              >
                Cancel
              </button>
              <button
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                onClick={handleDeleteLocation}
                disabled={processingLocation}
              >
                {processingLocation ? (
                  <span className="flex items-center justify-center">
                    <Loader size={16} className="animate-spin mr-2" />
                    Deleting...
                  </span>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default AdminDashboard;