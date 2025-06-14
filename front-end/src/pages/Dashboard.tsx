import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Wallet, Clock, MapPin, TrendingUp, Car, Star, Map, Calendar, User, ArrowRight } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS
import L from 'leaflet';
import BennettLogo from '../assets/Bennett-Logo-VerticalColor.png';
import { useAuth } from '../utils/AuthContext';

// Fix for default marker icons (Leaflet requires this for proper marker rendering)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const mockData = [
  { name: 'Mon', trips: 4, spending: 120 },
  { name: 'Tue', trips: 3, spending: 90 },
  { name: 'Wed', trips: 5, spending: 150 },
  { name: 'Thu', trips: 2, spending: 60 },
  { name: 'Fri', trips: 6, spending: 180 },
  { name: 'Sat', trips: 4, spending: 120 },
  { name: 'Sun', trips: 3, spending: 90 },
];

const upcomingRides = [
  { id: 1, date: '2025-03-23', time: '08:30 AM', route: 'Campus - Downtown' },
  { id: 2, date: '2025-03-24', time: '03:00 PM', route: 'Downtown - Campus' },
];

// Hardcoded coordinates for Downtown (we'll keep this as the destination)
const downtownLocation = [37.7849, -122.4094]; // Example: Downtown (San Francisco)

const Dashboard = () => {
  // State for the user's live location
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [balance, setBalance] = useState(250); // Default value
  const { user } = useAuth();

  // Fetch the user's live location when the component mounts
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
        },
        (error) => {
          setLocationError(error.message);
          // Fallback to hardcoded Campus location if geolocation fails
          setUserLocation([37.7749, -122.4194]); // Example: Campus (San Francisco)
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setLocationError('Geolocation is not supported by this browser.');
      setUserLocation([37.7749, -122.4194]); // Fallback to hardcoded Campus location
    }
  }, []);

  // Add this useEffect to update the balance when the user data is available
  useEffect(() => {
    // Get credits from the authenticated user
    if (user && user.credits !== undefined) {
      setBalance(user.credits);
    }
  }, [user]);

  // Path coordinates for the route (from user's live location to Downtown)
  const pathCoordinates = userLocation ? [userLocation, downtownLocation] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Welcome Back, [xAI]!</h1>
        <div className="flex items-center space-x-3">
          <button className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors">
            <Calendar className="w-6 h-6" />
          </button>
          <button className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors">
            <User className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: User Profile and Map Preview */}
        <div className="lg:col-span-1 space-y-6">
          {/* User Profile Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 text-center transition-transform hover:scale-105">
            <img
              src={BennettLogo}
              alt="User Avatar"
              className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-blue-200"
            />
            <h2 className="text-xl font-bold text-gray-800">[xAI]</h2>
            <p className="text-gray-500 text-sm">CyberCab Member</p>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500 text-sm">Total Trips</p>
                <p className="text-lg font-bold text-blue-600">38</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Spent</p>
                <p className="text-lg font-bold text-blue-600">$950.00</p>
              </div>
            </div>
          </div>

          {/* Map Preview */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Route Preview</h2>
            {locationError && (
              <p className="text-red-500 text-sm mb-2">
                Location Error: {locationError}. Using default location.
              </p>
            )}
            {userLocation ? (
              <MapContainer
                center={userLocation}
                zoom={14}
                style={{ height: '200px', borderRadius: '8px' }}
                className="rounded-lg"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={userLocation}>
                  <Popup>Your Location</Popup>
                </Marker>
                <Marker position={downtownLocation}>
                  <Popup>Downtown</Popup>
                </Marker>
                <Polyline positions={pathCoordinates} color="blue" />
              </MapContainer>
            ) : (
              <div className="h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                <Map className="w-12 h-12 text-gray-500" />
                <p className="text-gray-500 ml-2">Loading your location...</p>
              </div>
            )}
            <p className="mt-2 text-sm text-gray-600">
              Last Trip: {userLocation ? 'Your Location' : 'Campus'} to Downtown
            </p>
            <button className="mt-2 text-blue-600 hover:underline">View Full Route</button>
          </div>
        </div>

        {/* Right Column: Stats, Charts, and More */}
        <div className="lg:col-span-3 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Wallet, label: 'Balance', value: `${balance.toFixed(2)}`, color: 'text-blue-600' },
              { icon: Clock, label: 'Recent Trips', value: '23', color: 'text-green-600' },
              { icon: MapPin, label: 'Favorite Route', value: 'Campus - Downtown', color: 'text-purple-600' },
              { icon: TrendingUp, label: 'This Month', value: '+15 Trips', color: 'text-orange-600' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-xl shadow-lg p-6 transition-transform hover:scale-105"
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-500 text-sm">{stat.label}</p>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Weekly Activity Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Weekly Activity</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 0, 0, 0.1)" />
                  <XAxis dataKey="name" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px',
                      color: '#1f2937',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="spending"
                    stroke="#1f2937"
                    strokeWidth={2}
                    dot={{ fill: '#1f2937' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="trips"
                    stroke="#6b7280"
                    strokeWidth={2}
                    dot={{ fill: '#6b7280' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Upcoming Rides */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Upcoming Rides</h2>
            <div className="space-y-4">
              {upcomingRides.map((ride) => (
                <div
                  key={ride.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <Calendar className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="font-semibold text-gray-800">{ride.route}</p>
                      <p className="text-sm text-gray-500">
                        {ride.date} at {ride.time}
                      </p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:underline">View Details</button>
                </div>
              ))}
            </div>
          </div>

          {/* Rewards Section */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl shadow-lg p-6 text-white">
            <h2 className="text-xl font-bold mb-4">Rewards & Achievements</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Star className="w-6 h-6 text-yellow-400" />
                  <div>
                    <p className="font-semibold">Frequent Rider</p>
                    <p className="text-sm opacity-80">Completed 20 trips this month!</p>
                  </div>
                </div>
                <span className="text-sm bg-yellow-400 text-blue-800 px-2 py-1 rounded-full">Earned</span>
              </div>
              <div>
                <p className="text-sm mb-2">Next Reward: Super Commuter (50 trips)</p>
                <div className="w-full bg-blue-400 rounded-full h-2.5">
                  <div className="bg-yellow-400 h-2.5 rounded-full" style={{ width: '76%' }}></div>
                </div>
                <p className="text-sm mt-1 opacity-80">38/50 trips completed</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <div className="flex items-center space-x-2">
                  <Car className="w-5 h-5" />
                  <span>Book a Ride</span>
                </div>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="w-full flex items-center justify-between p-3 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
                <div className="flex items-center space-x-2">
                  <Wallet className="w-5 h-5" />
                  <span>Recharge Wallet</span>
                </div>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;