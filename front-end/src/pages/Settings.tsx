import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Shield, Save } from 'lucide-react';
import { useAuth } from '../utils/AuthContext';

function Settings() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // Load user data from auth context
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        password: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would normally send the updated user data to your API
    
    // For now, just show a success notification
    setNotification({ 
      show: true, 
      message: 'Profile updated successfully!', 
      type: 'success' 
    });
    
    setIsEditing(false);
    
    // Hide notification after 3 seconds
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  // If user data is not loaded yet
  if (!user) {
    return <div className="p-6 text-center">Loading user details...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>

      {notification.show && (
        <div className={`p-4 mb-6 rounded-lg ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {notification.message}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Personal Information</h2>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full pl-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full pl-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={true} // Email cannot be changed
                  className="w-full pl-10 py-2 border rounded-lg bg-gray-100 text-gray-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Email address cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Credit Balance</label>
              <div className="relative">
                <div className="w-full pl-10 py-2 border rounded-lg bg-gray-100">
                  <span className="text-gray-700 font-medium">{user.credits} credits</span>
                </div>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-3">Change Password</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="w-full pl-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {isEditing && (
            <div className="mt-6">
              <button
                type="submit"
                className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Save size={18} />
                Save Changes
              </button>
            </div>
          )}
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Account Information</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <h3 className="font-medium">Account ID</h3>
              <p className="text-gray-500 text-sm">Your unique identifier</p>
            </div>
            <div className="text-gray-700">{user.id}</div>
          </div>

          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <h3 className="font-medium">Account Type</h3>
              <p className="text-gray-500 text-sm">Your account level</p>
            </div>
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              {user.role === 'user' ? 'Regular User' : user.role === 'admin' ? 'Administrator' : 'Prime Administrator'}
            </div>
          </div>

          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <h3 className="font-medium">Account Status</h3>
              <p className="text-gray-500 text-sm">Current account status</p>
            </div>
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
              Active
            </div>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <h3 className="font-medium">Verification Status</h3>
              <p className="text-gray-500 text-sm">Email verification</p>
            </div>
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
              Verified
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

<<<<<<< HEAD
export default Settings; 
=======
export default Settings; 
>>>>>>> dc78d568a6e80852b3419d19e72e6b51da2f09e0
