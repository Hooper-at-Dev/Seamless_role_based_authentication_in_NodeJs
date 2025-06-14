import React, { useState } from 'react';
import { History, Download, Clock, MapPin, Repeat, CreditCard, ChevronDown } from 'lucide-react';

interface Trip {
  id: string;
  date: string;
  time: string;
  route: {
    from: string;
    to: string;
  };
  fare: number;
  status: 'completed' | 'cancelled';
}

const mockTrips: Trip[] = [
  {
    id: '1',
    date: '2024-03-15',
    time: '14:30',
    route: {
      from: 'Main Gate',
      to: 'Academic Block'
    },
    fare: 25,
    status: 'completed'
  },
  {
    id: '2',
    date: '2024-03-14',
    time: '09:15',
    route: {
      from: 'Hostel Complex',
      to: 'Library'
    },
    fare: 30,
    status: 'completed'
  },
  {
    id: '3',
    date: '2024-03-13',
    time: '16:45',
    route: {
      from: 'Sports Complex',
      to: 'Main Gate'
    },
    fare: 35,
    status: 'cancelled'
  }
];

const frequentRoutes = [
  { id: '1', from: 'Main Gate', to: 'Academic Block', frequency: 15 },
  { id: '2', from: 'Hostel Complex', to: 'Library', frequency: 12 },
  { id: '3', from: 'Sports Complex', to: 'Cafeteria', frequency: 8 }
];

export default function TripHistory() {
  const [selectedMonth, setSelectedMonth] = useState('March 2024');
  const [expandedTrip, setExpandedTrip] = useState<string | null>(null);

  const downloadReport = () => {
    console.log('Downloading report...');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white">
      {/* Header with Month Selection and Download Button */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <History className="w-8 h-8 text-black" />
          <h1 className="text-2xl font-bold text-black">Trip History</h1>
        </div>
        <button
          onClick={downloadReport}
          className="flex items-center space-x-2 bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition-colors shadow-md"
        >
          <Download className="w-4 h-4" />
          <span>Download Report</span>
        </button>
      </div>

      {/* Frequent Routes */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-200">
        <h2 className="text-xl font-semibold text-black mb-4">Frequent Routes</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {frequentRoutes.map(route => (
            <div
              key={route.id}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-400 transition-colors"
            >
              <div className="flex items-center space-x-2 text-gray-600 mb-2">
                <Repeat className="w-4 h-4" />
                <span className="text-sm">{route.frequency} trips</span>
              </div>
              <div className="flex items-center justify-between text-black">
                <span>{route.from}</span>
                <ChevronDown className="w-4 h-4 text-gray-600 rotate-[-90deg]" />
                <span>{route.to}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trip List */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-black">Recent Trips</h2>
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-white text-black border border-gray-300 rounded-lg px-4 py-2 appearance-none cursor-pointer focus:outline-none focus:border-black shadow-sm"
            >
              <option>March 2024</option>
              <option>February 2024</option>
              <option>January 2024</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
          </div>
        </div>

        <div className="space-y-4">
          {mockTrips.map(trip => (
            <div
              key={trip.id}
              className={`bg-gray-50 rounded-lg p-4 border border-gray-200 cursor-pointer transition-all ${
                expandedTrip === trip.id ? 'border-black shadow-md' : 'hover:border-gray-400'
              }`}
              onClick={() => setExpandedTrip(expandedTrip === trip.id ? null : trip.id)}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{trip.time}</span>
                  </div>
                  <div className="text-black">
                    <span>{trip.route.from}</span>
                    <ChevronDown className="inline-block w-4 h-4 mx-2 text-gray-600 rotate-[-90deg]" />
                    <span>{trip.route.to}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span
                    className={`px-2 py-1 rounded text-sm font-medium ${
                      trip.status === 'completed'
                        ? 'bg-black text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {trip.status}
                  </span>
                  <div className="flex items-center space-x-2 text-black">
                    <CreditCard className="w-4 h-4 text-gray-600" />
                    <span>₹{trip.fare}</span>
                  </div>
                </div>
              </div>

              {expandedTrip === trip.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 font-medium">Date</p>
                      <p className="text-black">{trip.date}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">Time</p>
                      <p className="text-black">{trip.time}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">From</p>
                      <p className="text-black">{trip.route.from}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">To</p>
                      <p className="text-black">{trip.route.to}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">Fare</p>
                      <p className="text-black">₹{trip.fare}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">Status</p>
                      <p
                        className={
                          trip.status === 'completed' ? 'text-black font-semibold' : 'text-gray-600'
                        }
                      >
                        {trip.status}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}