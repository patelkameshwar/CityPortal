import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hotelAPI, bookingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiSearch, FiMapPin, FiHome, FiX, FiCalendar, FiUsers } from 'react-icons/fi';

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const Hotels = () => {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    rooms: 1,
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState('');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      const response = await hotelAPI.getAll();
      setHotels(response.data.hotels || []);
    } catch (err) {
      setError('Failed to load hotels');
    } finally {
      setLoading(false);
    }
  };

  const filteredHotels = hotels.filter((hotel) =>
    hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBookNow = (hotel) => {
    if (!isAuthenticated) {
      alert('Please login to book a hotel');
      return;
    }
    setSelectedHotel(hotel);
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    setBookingData({
      checkIn: formatDate(today),
      checkOut: formatDate(tomorrow),
      rooms: 1,
    });
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    setBookingSuccess('');

    try {
      const fromDate = new Date(bookingData.checkIn);
      const toDate = new Date(bookingData.checkOut);
      const days = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24));
      const totalPrice = selectedHotel.pricePerNight * days * bookingData.rooms;

      await bookingAPI.create({
        itemType: 'Hotel',
        itemId: selectedHotel._id,
        bookingFromDate: bookingData.checkIn,
        bookingToDate: bookingData.checkOut,
        totalQuantity: bookingData.rooms,
        totalPrice,
      });

      setBookingSuccess('Hotel booked successfully!');
      setTimeout(() => {
        setSelectedHotel(null);
        setBookingSuccess('');
      }, 2000);
    } catch (err) {
      alert(err.response?.data?.message || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!selectedHotel || !bookingData.checkIn || !bookingData.checkOut) return 0;
    const fromDate = new Date(bookingData.checkIn);
    const toDate = new Date(bookingData.checkOut);
    const days = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24));
    return selectedHotel.pricePerNight * days * bookingData.rooms;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Find Your Perfect Hotel</h1>
        <p className="text-gray-600 mt-2">Discover comfortable stays across the city</p>
      </div>

      <div className="max-w-xl mx-auto mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search hotels by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-5 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
          <FiSearch className="absolute right-4 top-3.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {error && (
        <div className="max-w-4xl mx-auto mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {filteredHotels.length > 0 ? (
          filteredHotels.map((hotel) => (
            <div 
              key={hotel._id} 
              onClick={() => navigate(`/hotels/${hotel._id}`)}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer"
            >
              <div className="h-48 bg-gray-200 relative">
                {hotel.images && hotel.images.length > 0 ? (
                  <img src={hotel.images[0]} alt={hotel.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <FiHome className="h-16 w-16" />
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  ${hotel.pricePerNight}/night
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{hotel.name}</h3>
                <div className="flex items-center text-gray-600 mb-2">
                  <FiMapPin className="h-4 w-4 mr-1" />
                  {hotel.location}
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{hotel.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{hotel.totalRooms} rooms available</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBookNow(hotel);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 text-lg">No hotels found</p>
          </div>
        )}
      </div>

      {selectedHotel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Book {selectedHotel.name}</h3>
              <button onClick={() => setSelectedHotel(null)} className="text-gray-400 hover:text-gray-600">
                <FiX className="h-6 w-6" />
              </button>
            </div>

            {bookingSuccess && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                {bookingSuccess}
              </div>
            )}

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Date</label>
                <input
                  type="date"
                  value={bookingData.checkIn}
                  onChange={(e) => setBookingData({ ...bookingData, checkIn: e.target.value })}
                  required
                  min={getTodayDate()}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Date</label>
                <input
                  type="date"
                  value={bookingData.checkOut}
                  onChange={(e) => setBookingData({ ...bookingData, checkOut: e.target.value })}
                  required
                  min={bookingData.checkIn || getTodayDate()}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Rooms</label>
                <input
                  type="number"
                  min="1"
                  max={selectedHotel.totalRooms}
                  value={bookingData.rooms}
                  onChange={(e) => setBookingData({ ...bookingData, rooms: parseInt(e.target.value) })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="bg-gray-100 p-3 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Price per night:</span>
                  <span className="font-medium">${selectedHotel.pricePerNight}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-bold text-lg">${calculateTotal()}</span>
                </div>
              </div>
              <button
                type="submit"
                disabled={bookingLoading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-medium"
              >
                {bookingLoading ? 'Processing...' : 'Confirm Booking'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hotels;

