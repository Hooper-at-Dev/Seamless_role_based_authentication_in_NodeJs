import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Bell, 
  Moon, 
  Sun, 
  LogOut, 
  Trash2, 
  Shield, 
  Upload,
  Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  notifications: {
    email: boolean;
    push: boolean;
  };
  darkMode: boolean;
  twoFactorEnabled: boolean;
}

export default function Profile() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile>({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+91 98765 43210',
    avatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop',
    notifications: {
      email: true,
      push: false,
    },
    darkMode: true,
    twoFactorEnabled: false,
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProfile = () => {
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <User className="w-8 h-8 text-black" />
        <h1 className="text-2xl font-bold text-black">Account Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Picture Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32 mb-4">
                <img
                  src={profile.avatar}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover border-2 border-gray-300"
                />
                <label className="absolute bottom-0 right-0 bg-black p-2 rounded-full cursor-pointer hover:bg-gray-800 transition-colors">
                  <Upload className="w-4 h-4 text-white" />
                  <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                </label>
              </div>
              <h2 className="text-xl font-semibold text-black mb-2">{profile.name}</h2>
              <p className="text-gray-600">{profile.email}</p>
            </div>
          </div>
        </div>

        {/* Main Settings Section */}
        <div className="lg:col-span-2 space-y-8">
          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-black mb-6">Personal Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-600 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" />
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-gray-50 text-black pl-12 pr-4 py-2 rounded-lg border border-gray-300 focus:border-black focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-600 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" />
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-gray-50 text-black pl-12 pr-4 py-2 rounded-lg border border-gray-300 focus:border-black focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-600 mb-2">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" />
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-gray-50 text-black pl-12 pr-4 py-2 rounded-lg border border-gray-300 focus:border-black focus:outline-none"
                  />
                </div>
              </div>
              <button
                onClick={saveProfile}
                className="w-full bg-black hover:bg-gray-800 text-white py-2 rounded-lg transition-colors mt-4 shadow-md"
              >
                Save Changes
              </button>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-black mb-6">Security</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-600 mb-2">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" />
                  <input
                    type="password"
                    value={passwords.current}
                    onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                    className="w-full bg-gray-50 text-black pl-12 pr-4 py-2 rounded-lg border border-gray-300 focus:border-black focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-600 mb-2">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" />
                  <input
                    type="password"
                    value={passwords.new}
                    onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                    className="w-full bg-gray-50 text-black pl-12 pr-4 py-2 rounded-lg border border-gray-300 focus:border-black focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-600 mb-2">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" />
                  <input
                    type="password"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                    className="w-full bg-gray-50 text-black pl-12 pr-4 py-2 rounded-lg border border-gray-300 focus:border-black focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between py-4">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-gray-600" />
                  <span className="text-black">Two-Factor Authentication</span>
                </div>
                <button
                  onClick={() => setProfile(prev => ({ ...prev, twoFactorEnabled: !prev.twoFactorEnabled }))}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    profile.twoFactorEnabled
                      ? 'bg-black text-white hover:bg-gray-800'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {profile.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-black mb-6">Preferences</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <span className="text-black">Email Notifications</span>
                </div>
                <button
                  onClick={() => setProfile(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, email: !prev.notifications.email }
                  }))}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    profile.notifications.email
                      ? 'bg-black text-white hover:bg-gray-800'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {profile.notifications.email ? 'Enabled' : 'Disabled'}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <span className="text-black">Push Notifications</span>
                </div>
                <button
                  onClick={() => setProfile(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, push: !prev.notifications.push }
                  }))}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    profile.notifications.push
                      ? 'bg-black text-white hover:bg-gray-800'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {profile.notifications.push ? 'Enabled' : 'Disabled'}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {profile.darkMode ? (
                    <Moon className="w-5 h-5 text-gray-600" />
                  ) : (
                    <Sun className="w-5 h-5 text-gray-600" />
                  )}
                  <span className="text-black">Theme</span>
                </div>
                <button
                  onClick={() => setProfile(prev => ({ ...prev, darkMode: !prev.darkMode }))}
                  className="px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg transition-colors"
                >
                  {profile.darkMode ? 'Dark Mode' : 'Light Mode'}
                </button>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-black mb-6">Account Actions</h2>
            <div className="space-y-4">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 bg-black hover:bg-gray-800 text-white py-2 rounded-lg transition-colors shadow-md"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full flex items-center justify-center space-x-2 bg-gray-200 hover:bg-gray-300 text-black py-2 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5 text-gray-600" />
                <span>Delete Account</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl border border-gray-200 max-w-md w-full mx-4 shadow-lg">
            <h3 className="text-xl font-semibold text-black mb-4">Delete Account</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete your account? This action cannot be undone.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-black py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-black hover:bg-gray-800 text-white py-2 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed bottom-4 right-4 bg-black text-white px-6 py-3 rounded-lg flex items-center space-x-2 shadow-md">
          <Check className="w-5 h-5" />
          <span>Changes saved successfully!</span>
        </div>
      )}
    </div>
  );
}