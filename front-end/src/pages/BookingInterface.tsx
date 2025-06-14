import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, AlertCircle, ChevronDown, Wallet as WalletIcon } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import { ref, set } from 'firebase/database';
import { database } from './firebase';
import { locationAPI, DropoffLocation } from '../utils/api';
import { useAuth } from '../utils/AuthContext';

// Leaflet icon configuration
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Predefined stops
const predefinedStops = [
  { name: "A block", latitude: 28.450184, longitude: 77.584425, address: "A block" },
  { name: "B block", latitude: 28.450151, longitude: 77.584286, address: "B block" },
  { name: "Sports Complex", latitude: 28.45018041097755, longitude:  77.5871834486546, address: "Sports Complex" },
  { name: "N block", latitude: 28.448933, longitude:  77.583559, address: "N block" },
  { name: "P block", latitude: 28.449785, longitude: 77.582806, address: "P block" },
  { name: "Cafeteria", latitude: 28.450490, longitude: 77.586394, address: "Cafeteria" }
];

const vehicleTypes = [
  { id: 'standard', name: 'Standard', basePrice: 10, icon: '🚗' },
  { id: 'premium', name: 'Premium', basePrice: 15, icon: '🚙' },
  { id: 'shared', name: 'Shared', basePrice: 7, icon: '🚐' }
];

interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

interface BookingFormData {
  pickup: Location | null;
  dropoff: Location | null;
  vehicleType: string;
  isScheduled: boolean;
  scheduleTime?: Date;
  stops?: Location[];
}

function useRoutingLine(map: L.Map | null, pickup: Location | null, dropoff: Location | null) {
  const routingControlRef = useRef<any>(null);
  const [shortestRoute, setShortestRoute] = useState<number | null>(null);

  useEffect(() => {
    if (!map || !pickup || !dropoff) return;

    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
    }

    const waypoints = [
      L.latLng(pickup.latitude, pickup.longitude),
      L.latLng(dropoff.latitude, dropoff.longitude)
    ];

    routingControlRef.current = L.Routing.control({
      waypoints,
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      showAlternatives: true,
      lineOptions: {
        styles: [
          { color: '#3B82F6', weight: 4, opacity: 0.8 }
        ],
        alternativeStyles: [
          { color: '#EF4444', weight: 4, opacity: 0.8, dashArray: '5,10' }
        ]
      }
    }).addTo(map);

    const container = routingControlRef.current.getContainer();
    container.style.display = 'none';

    routingControlRef.current.on('routesfound', function(e: any) {
      const routes = e.routes;
      if (routes.length >= 2) {
        let shortestDistance = Infinity;
        let shortestIndex = 0;

        routes.forEach((route: any, index: number) => {
          if (route.summary.totalDistance < shortestDistance) {
            shortestDistance = route.summary.totalDistance;
            shortestIndex = index;
          }
        });

        setShortestRoute(shortestIndex);

        const legend = L.control({ position: 'bottomright' });
        legend.onAdd = function() {
          const div = L.DomUtil.create('div', 'route-legend');
          div.innerHTML = `
            <div style="
              background: white;
              padding: 10px;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              font-size: 12px;
            ">
              <div style="margin-bottom: 5px;">
                <span style="
                  display: inline-block;
                  width: 12px;
                  height: 12px;
                  background: #3B82F6;
                  margin-right: 5px;
                  border-radius: 50%;
                "></span>
                Shortest Route (${(routes[shortestIndex].summary.totalDistance / 1000).toFixed(1)} km)
              </div>
              <div>
                <span style="
                  display: inline-block;
                  width: 12px;
                  height: 12px;
                  background: #EF4444;
                  margin-right: 5px;
                  border-radius: 50%;
                "></span>
                Alternative Route (${(routes[1 - shortestIndex].summary.totalDistance / 1000).toFixed(1)} km)
              </div>
            </div>
          `;
          return div;
        };
        legend.addTo(map);
      }
    });

    return () => {
      if (map && routingControlRef.current) {
        map.removeControl(routingControlRef.current);
        const legends = document.getElementsByClassName('route-legend');
        Array.from(legends).forEach(legend => legend.remove());
      }
    };
  }, [map, pickup, dropoff]);

  return shortestRoute;
}

function LocationMarker({ onLocationUpdate }: { onLocationUpdate: (location: [number, number]) => void }) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const map = useMap();

  useEffect(() => {
    map.locate().on("locationfound", function (e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
      map.flyTo(e.latlng, 15);
      onLocationUpdate([e.latlng.lat, e.latlng.lng]);
    });
  }, [map]);

  return position === null ? null : (
    <Marker position={position}>
      <Popup>You are here</Popup>
    </Marker>
  );
}

function MapEvents({ onClick }: { onClick: (e: L.LeafletMouseEvent) => void }) {
  useMapEvents({
    click: onClick,
  });
  return null;
}

const BookingInterface = () => {
  const [formData, setFormData] = useState<BookingFormData>({
    pickup: null,
    dropoff: null,
    vehicleType: 'standard',
    isScheduled: false,
    stops: []
  });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [fare, setFare] = useState(0);
  const [balance, setBalance] = useState(() => {
    const savedBalance = localStorage.getItem('walletBalance');
    return savedBalance ? parseFloat(savedBalance) : 250.00;
  });
  const [isSettingPickup, setIsSettingPickup] = useState(true);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [driverLocation, setDriverLocation] = useState<[number, number] | null>(null);
  const [showDropoffLocations, setShowDropoffLocations] = useState(false);
  const [showStopsDropdown, setShowStopsDropdown] = useState(false);
  const [dropoffLocations, setDropoffLocations] = useState<DropoffLocation[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const { token, user } = useAuth();

  useRoutingLine(mapRef.current, formData.pickup, formData.dropoff);

  useEffect(() => {
    const fetchDropoffLocations = async () => {
      setLoadingLocations(true);
      setLocationError(null);
      try {
        if (token) {
          const response = await locationAPI.getDropoffLocations(token);
          setDropoffLocations(response);
        }
      } catch (error) {
        console.error('Error fetching dropoff locations:', error);
        setLocationError('Failed to load dropoff locations');
      } finally {
        setLoadingLocations(false);
      }
    };

    fetchDropoffLocations();
  }, [token]);

  useEffect(() => {
    if (formData.pickup) {
      const R = 6371; // Radius of Earth in km
      const basePrice = vehicleTypes.find(v => v.id === formData.vehicleType)?.basePrice || 10;
      let totalDistance = 0;

      const calculateDistance = (from: Location, to: Location) => {
        const lat1 = from.latitude * Math.PI / 180;
        const lat2 = to.latitude * Math.PI / 180;
        const dLat = (to.latitude - from.latitude) * Math.PI / 180;
        const dLon = (to.longitude - from.longitude) * Math.PI / 180;
        
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1) * Math.cos(lat2) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
      };

      const points = [
        formData.pickup,
        ...(formData.stops || []),
        formData.dropoff
      ].filter(Boolean) as Location[];

      for (let i = 0; i < points.length - 1; i++) {
        totalDistance += calculateDistance(points[i], points[i + 1]);
      }

      const calculatedFare = totalDistance * basePrice;
      setFare(Math.round(calculatedFare * 100) / 100);
    }
  }, [formData.pickup, formData.dropoff, formData.vehicleType, formData.stops]);

  useEffect(() => {
    // Get credits from the authenticated user
    if (user && user.credits !== undefined) {
      setBalance(user.credits);
    }
  }, [user]);

  const handleMapClick = async (e: L.LeafletMouseEvent) => {
    const { lat, lng } = e.latlng;
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      
      const location: Location = {
        latitude: lat,
        longitude: lng,
        address: data.display_name
      };

      setFormData(prev => ({
        ...prev,
        [isSettingPickup ? 'pickup' : 'dropoff']: location
      }));
    } catch (error) {
      console.error('Error getting address:', error);
    }
  };

  const handleStopSelect = (stop: typeof predefinedStops[0]) => {
    console.log('Selected stop:', stop);
    setFormData(prev => ({
      ...prev,
      stops: [
        ...(prev.stops || []),
        {
          latitude: stop.latitude,
          longitude: stop.longitude,
          address: stop.address
        }
      ]
    }));
    setShowStopsDropdown(false);
    
    if (mapRef.current) {
      mapRef.current.flyTo([stop.latitude, stop.longitude], 15);
    }
  };

  const handleBooking = () => {
    if (balance >= fare) {
      const newBalance = balance - fare;
      setBalance(newBalance);
      localStorage.setItem('walletBalance', newBalance.toString());
      setShowConfirmation(true);
      
      const tripHistory = JSON.parse(localStorage.getItem('tripHistory') || '[]');
      tripHistory.push({
        date: new Date().toISOString(),
        pickup: formData.pickup?.address,
        dropoff: formData.dropoff?.address,
        fare: fare,
        vehicleType: formData.vehicleType
      });
      localStorage.setItem('tripHistory', JSON.stringify(tripHistory));

      simulateDriverMovement();
    }
  };

  const simulateDriverMovement = () => {
    if (formData.pickup) {
      const driverRef = ref(database, 'drivers/active/driver1');
      let progress = 0;
      
      const interval = setInterval(() => {
        if (progress >= 1 || !formData.pickup) {
          clearInterval(interval);
          return;
        }

        progress += 0.1;
        const currentLat = formData.pickup.latitude;
        const currentLng = formData.pickup.longitude;
        
        set(driverRef, {
          location: {
            latitude: currentLat + (Math.random() - 0.5) * 0.01,
            longitude: currentLng + (Math.random() - 0.5) * 0.01
          }
        });
      }, 3000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6 bg-white p-6"
    >
      <h1 className="text-3xl font-bold text-black mb-6">Book a Ride</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          className="border border-gray-300 p-6 bg-white shadow-md rounded-lg"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold text-black mb-4">Select Location</h2>
          
          <div className="space-y-4">
            <div className="h-[400px] relative rounded-lg overflow-hidden border border-gray-300">
              <MapContainer
                center={[28.6139, 77.2090]}
                zoom={13}
                ref={mapRef}
                className="h-full"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution=""
                />
                <LocationMarker onLocationUpdate={setUserLocation} />
                <MapEvents onClick={handleMapClick} />
                
                {formData.pickup && (
                  <Marker 
                    position={[formData.pickup.latitude, formData.pickup.longitude]}
                    icon={L.divIcon({
                      className: 'location-marker pickup',
                      iconSize: [24, 24],
                      html: '<div style="background-color: #000; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white;"></div>'
                    })}
                  >
                    <Popup>Pickup: {formData.pickup.address}</Popup>
                  </Marker>
                )}
                
                {formData.dropoff && (
                  <Marker 
                    position={[formData.dropoff.latitude, formData.dropoff.longitude]}
                    icon={L.divIcon({
                      className: 'location-marker dropoff',
                      iconSize: [24, 24],
                      html: '<div style="background-color: #666; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white;"></div>'
                    })}
                  >
                    <Popup>Dropoff: {formData.dropoff.address}</Popup>
                  </Marker>
                )}

                {formData.stops && formData.stops.map((stop, index) => (
                  <Marker 
                    key={index}
                    position={[stop.latitude, stop.longitude]}
                    icon={L.divIcon({
                      className: 'location-marker stop',
                      iconSize: [20, 20],
                      html: '<div style="background-color: #999; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>'
                    })}
                  >
                    <Popup>Stop: {stop.address}</Popup>
                  </Marker>
                ))}

                {driverLocation && (
                  <Marker 
                    position={driverLocation}
                    icon={L.divIcon({
                      className: 'location-marker driver',
                      iconSize: [24, 24],
                      html: '<div style="background-color: #333; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white;"></div>'
                    })}
                  >
                    <Popup>Driver Location</Popup>
                  </Marker>
                )}
              </MapContainer>
            </div>

            <div className="flex space-x-4">
              <button
                className={`flex-1 py-2 px-4 rounded-lg border transition-all duration-300 ${
                  isSettingPickup
                    ? 'bg-black text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
                onClick={() => setIsSettingPickup(true)}
              >
                Set Pickup
              </button>
              <button
                className={`flex-1 py-2 px-4 rounded-lg border transition-all duration-300 ${
                  !isSettingPickup
                    ? 'bg-black text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
                onClick={() => setIsSettingPickup(false)}
              >
                Set Dropoff
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <MapPin className="text-black" size={20} />
                <span className="text-gray-600">Pickup:</span>
                <span className="text-black truncate">
                  {formData.pickup?.address || 'Click on map to set pickup'}
                </span>
              </div>
              
              <div className="relative">
                <div 
                  className="flex items-center space-x-2 cursor-pointer"
                  onClick={() => {
                    console.log('Toggling dropoff locations dropdown');
                    setShowDropoffLocations(!showDropoffLocations);
                  }}
                >
                  <MapPin className="text-gray-600" size={20} />
                  <span className="text-gray-600">Dropoff:</span>
                  <span className="text-black truncate flex-1">
                    {formData.dropoff?.address || 'Select or click on map'}
                  </span>
                  <ChevronDown 
                    className={`transition-transform ${showDropoffLocations ? 'rotate-180' : ''}`} 
                    size={20}
                  />
                </div>
                
                {showDropoffLocations && (
                  <div className="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {loadingLocations ? (
                      <div className="p-4 text-center text-gray-600">
                        Loading dropoff locations...
                      </div>
                    ) : locationError ? (
                      <div className="p-4 text-center text-red-600">
                        {locationError}
                      </div>
                    ) : dropoffLocations.length === 0 ? (
                      <div className="p-4 text-center text-gray-600">
                        No dropoff locations available
                      </div>
                    ) : (
                      dropoffLocations.map((location) => (
                        <div
                          key={location.id}
                          className="p-3 hover:bg-gray-100 cursor-pointer transition-colors border-b last:border-b-0"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              dropoff: {
                                latitude: location.latitude,
                                longitude: location.longitude,
                                address: location.address
                              }
                            }));
                            setShowDropoffLocations(false);
                            if (mapRef.current) {
                              mapRef.current.flyTo([location.latitude, location.longitude], 15);
                            }
                          }}
                        >
                          <div className="font-medium text-black">{location.name}</div>
                          <div className="text-sm text-gray-600 truncate">{location.address}</div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-gray-600 mb-2">Vehicle Type</label>
              <div className="grid grid-cols-3 gap-4">
                {vehicleTypes.map(vehicle => (
                  <button
                    key={vehicle.id}
                    className={`p-4 rounded-lg border transition-all duration-300 ${
                      formData.vehicleType === vehicle.id
                        ? 'border-black bg-gray-100 shadow-md'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, vehicleType: vehicle.id }))}
                  >
                    <div className="text-2xl mb-2">{vehicle.icon}</div>
                    <div className="text-sm text-black">{vehicle.name}</div>
                    <div className="text-xs text-gray-600">{vehicle.basePrice}/km</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-2 text-gray-600">
                <input
                  type="checkbox"
                  checked={formData.isScheduled}
                  onChange={(e) => setFormData(prev => ({ ...prev, isScheduled: e.target.checked }))}
                  className="form-checkbox h-4 w-4 text-black rounded border-gray-400"
                />
                <span>Schedule for later</span>
              </label>
              
              {formData.isScheduled && (
                <div className="mt-4">
                  <input
                    type="datetime-local"
                    className="w-full p-2 border border-gray-300 rounded-lg text-black bg-white focus:outline-none focus:border-black"
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduleTime: new Date(e.target.value) }))}
                  />
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          className="border border-gray-300 p-6 bg-white shadow-md rounded-lg"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-xl font-semibold text-black mb-4">Fare Estimate</h2>
          
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-gray-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Base Fare</span>
                <span className="text-black">{vehicleTypes.find(v => v.id === formData.vehicleType)?.basePrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Distance Price</span>
                <span className="text-black">{(fare * 0.8).toFixed(2)}</span>
              </div>
              {new Date().getHours() >= 17 && new Date().getHours() <= 19 && (
                <div className="flex justify-between items-center mb-2 text-gray-600">
                  <span>Peak Hour Surge</span>
                  <span>x1.5</span>
                </div>
              )}
              <div className="border-t border-gray-300 mt-4 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-xl text-black">Total Fare</span>
                  <span className="text-2xl font-bold text-black">{fare.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gray-100 relative">
              <h3 className="text-lg font-semibold text-black mb-3">Route Stops</h3>
              
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-black"></div>
                  <span className="text-gray-600">Pickup:</span>
                  <span className="text-black truncate">
                    {formData.pickup?.address || 'Not set'}
                  </span>
                </div>
              </div>

              <div className="space-y-2 ml-4">
                {formData.stops?.map((stop, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                      <span className="text-black truncate max-w-[200px]">{stop.address}</span>
                    </div>
                    <button
                      className="text-red-600 hover:text-red-800 text-sm"
                      onClick={() => {
                        console.log('Removing stop at index:', index);
                        const newStops = formData.stops.filter((_, i) => i !== index);
                        setFormData(prev => ({ ...prev, stops: newStops }));
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="relative mt-2">
                <button
                  className={`text-sm flex items-center ${
                    !formData.pickup
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-blue-600 hover:text-blue-800'
                  }`}
                  onClick={() => {
                    if (!formData.pickup) return;
                    console.log('Toggling stops dropdown, current state:', showStopsDropdown);
                    setShowStopsDropdown(prev => !prev);
                  }}
                  disabled={!formData.pickup}
                >
                  <span className="mr-1">+</span> Add Stop
                  <ChevronDown 
                    className={`ml-1 transition-transform ${showStopsDropdown ? 'rotate-180' : ''}`} 
                    size={16}
                  />
                </button>

                {showStopsDropdown && (
                  <div className="absolute z-20 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {predefinedStops.map((stop, index) => (
                      <div
                        key={index}
                        className="p-3 hover:bg-gray-100 cursor-pointer transition-colors border-b last:border-b-0"
                        onClick={() => {
                          console.log('Stop clicked:', stop);
                          handleStopSelect(stop);
                        }}
                      >
                        <div className="font-medium text-black">{stop.name}</div>
                        <div className="text-sm text-gray-600 truncate">{stop.address}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-300">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-gray-600"></div>
                  <span className="text-gray-600">Dropoff:</span>
                  <span className="text-black truncate max-w-[200px]">
                    {formData.dropoff?.address || 'Not set'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center p-4 rounded-lg bg-gray-100">
              <div>
                <span className="text-gray-600">Wallet Balance</span>
                <div className="text-xl font-bold text-black">{balance.toFixed(2)}</div>
              </div>
              {balance < fare && (
                <div className="text-red-600 flex items-center">
                  <AlertCircle size={20} className="mr-2" />
                  Insufficient balance
                </div>
              )}
            </div>

            <button
              className={`w-full py-4 rounded-lg transition-colors ${
                (!formData.pickup || !formData.dropoff || balance < fare)
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
              onClick={handleBooking}
              disabled={!formData.pickup || !formData.dropoff || balance < fare}
            >
              Confirm Booking
            </button>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
          >
            <div className="border border-gray-300 p-8 max-w-md w-full mx-4 bg-white shadow-lg rounded-lg">
              <h3 className="text-2xl font-bold text-black mb-4">Ride Confirmed!</h3>
              <div className="space-y-4">
                <p className="text-gray-600">Your ride has been booked successfully.</p>
                <div className="p-4 rounded-lg bg-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Pickup</span>
                    <span className="text-black">{formData.pickup?.address}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Drop-off</span>
                    <span className="text-black">{formData.dropoff?.address}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Vehicle</span>
                    <span className="text-black">{vehicleTypes.find(v => v.id === formData.vehicleType)?.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Fare</span>
                    <span className="text-2xl font-bold text-black">{fare.toFixed(2)}</span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xl mb-2 text-black">ETA: 5 mins</p>
                  <p className="text-gray-600">Cab Number: CYB-{Math.floor(Math.random() * 1000)}</p>
                </div>
                <button
                  className="w-full py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                  onClick={() => setShowConfirmation(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default BookingInterface;