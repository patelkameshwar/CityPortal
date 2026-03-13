import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';
import { hotelAPI, bookingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiMapPin, FiHome, FiCalendar, FiUsers, FiArrowLeft, FiX, FiArrowRight, FiClock, FiTag, FiAlertCircle, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const HotelDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    rooms: 1,
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [activeTab, setActiveTab] = useState('amenities');
  const [similarHotels, setSimilarHotels] = useState([]);
  const [similarLoading, setSimilarLoading] = useState(false);
  const [similarError, setSimilarError] = useState('');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchHotel();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'similar' && hotel) {
      fetchSimilarHotels();
    }
  }, [activeTab, hotel]);

  const fetchHotel = async () => {
    try {
      const response = await hotelAPI.getById(id);
      setHotel(response.data.hotel);
    } catch (err) {
      setError('Failed to load hotel details');
    } finally {
      setLoading(false);
    }
  };

  const fetchSimilarHotels = async () => {
    if (!hotel) return;
    setSimilarLoading(true);
    setSimilarError('');
    try {
      const response = await hotelAPI.getSimilar(hotel._id);
      setSimilarHotels(response.data.similarHotels || []);
    } catch (err) {
      setSimilarError('Failed to load similar hotels');
    } finally {
      setSimilarLoading(false);
    }
  };

  const handleBookNow = () => {
    if (!isAuthenticated) {
      toast.error('Please login to book a hotel');
      navigate('/login');
      return;
    }
    
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
      const totalPrice = hotel.pricePerNight * days * bookingData.rooms;

      await bookingAPI.create({
        itemType: 'Hotel',
        itemId: hotel._id,
        bookingFromDate: bookingData.checkIn,
        bookingToDate: bookingData.checkOut,
        totalQuantity: bookingData.rooms,
        totalPrice,
      });

      toast.success('Hotel booked successfully!');
      setTimeout(() => {
        setBookingSuccess('');
        navigate('/my-bookings');
      }, 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!hotel || !bookingData.checkIn || !bookingData.checkOut) return 0;
    const fromDate = new Date(bookingData.checkIn);
    const toDate = new Date(bookingData.checkOut);
    const days = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24));
    return hotel.pricePerNight * days * bookingData.rooms;
  };

  const nextImage = () => {
    if (hotel && hotel.images) {
      setCurrentImageIndex((prev) => (prev + 1) % hotel.images.length);
    }
  };

  const prevImage = () => {
    if (hotel && hotel.images) {
      setCurrentImageIndex((prev) => (prev - 1 + hotel.images.length) % hotel.images.length);
    }
  };

  const openPhotoModal = () => {
    setCurrentImageIndex(0);
    setShowPhotoModal(true);
  };

  const closePhotoModal = () => {
    setShowPhotoModal(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Hotel not found</h2>
        <button
          onClick={() => navigate('/hotels')}
          className="text-blue-600 hover:underline"
        >
          Back to Hotels
        </button>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate('/hotels')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
        >
          <FiArrowLeft className="h-5 w-5" />
          Back to Hotels
        </button>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{hotel.name}</h1>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">

          <div className="flex flex-row gap-4 p-4">
            {/* Left Div - Image */}
            <div className="left-div w-2/3 rounded-xl">
              <div className="h-80 bg-gray-200 relative rounded-xl">
                {hotel.images && hotel.images.length > 0 ? (
                  <img
                    src={hotel.images[0]}
                    alt={hotel.name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <FiHome className="h-24 w-24" />
                  </div>
                )}
                
                {/* Property Photos Button */}
                {hotel.images && hotel.images.length > 0 && (
                  <button onClick={openPhotoModal} className="absolute bottom-4 right-4 bg-gray-800/70 border-2 border-white text-white px-4 py-2 rounded-4xl font-medium flex items-center gap-2 hover:bg-gray-800 transition -mb-2 cursor-pointer">
                    <span>{hotel.images.length}</span>
                    <span>Property Photos</span>
                    <FiArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Right Div - Info */}
            <div className="right-div w-1/3 p-6 bg-gray-100 border border-gray-300 flex flex-col gap-3 rounded-xl">
              <div className="text-gray-800 text-lg font-bold">
                Deluxe Room
              </div>
              <div className="flex items-center gap-1 text-gray-700 text-sm font-medium">
                <FiClock className="h-4 w-4" />
                Early check-in upto 2 hrs
              </div>
              <div className="flex items-center gap-1 text-gray-700 text-sm font-medium -mt-2">
                <FiAlertCircle className="h-4 w-4" />
                Non-Refundable
              </div>
              
              <div>
                <div className="flex items-center gap-1 text-gray-600 text-sm">
                  Per Night:
                </div>
                <div className="flex items-center gap-1 text-gray-800 text-2xl font-bold">
                  <span>₹</span>
                  {hotel.pricePerNight}
                </div>
              </div>
              
              <button
                onClick={handleBookNow}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Book Now
              </button>
            </div>
          </div>

          <div className="p-8">
            
            {/* About Properties Section */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">About Properties</h2>
              <p className="text-gray-600">{hotel.description}</p>
            </div>
            
            {/* Location and Rooms */}
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <FiMapPin className="h-5 w-5" />
              <span>{hotel.location}</span>
            </div>

            <div className="flex items-center gap-2 text-gray-600 mb-6">
              <FiUsers className="h-5 w-5" />
              <span>{hotel.totalRooms} rooms available</span>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab('amenities')}
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === 'amenities'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Amenities
              </button>
              <button
                onClick={() => setActiveTab('policies')}
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === 'policies'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Property Policies
              </button>
              <button
                onClick={() => setActiveTab('location')}
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === 'location'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Location
              </button>
              <button
                onClick={() => setActiveTab('similar')}
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === 'similar'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Similar Properties
              </button>
            </div>

            {/* Tab Content */}
            <div className="min-h-64">
              {activeTab === 'amenities' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Amenities</h2>
                  {hotel.amenities && hotel.amenities.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {hotel.amenities.map((amenity, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">No amenities available</p>
                  )}
                </div>
              )}

              {activeTab === 'policies' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Property Policies</h2>
                  <div className="space-y-4">
                    <div className="flex items-start gap-2">
                      <FiClock className="h-5 w-5 text-gray-600 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-gray-800">Check-in</h3>
                        <p className="text-gray-600 text-sm">From 12:00 PM</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <FiClock className="h-5 w-5 text-gray-600 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-gray-800">Check-out</h3>
                        <p className="text-gray-600 text-sm">Until 11:00 AM</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <FiAlertCircle className="h-5 w-5 text-gray-600 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-gray-800">Cancellation Policy</h3>
                        <p className="text-gray-600 text-sm">Non-Refundable</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <FiUsers className="h-5 w-5 text-gray-600 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-gray-800">Children & Beds</h3>
                        <p className="text-gray-600 text-sm">Children of all ages are welcome</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'location' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Location</h2>
                  <div className="flex items-start gap-2 mb-4">
                    <FiMapPin className="h-5 w-5 text-gray-600 mt-0.5" />
                    <div>
                      <p className="text-gray-800">{hotel.location}</p>
                    </div>
                  </div>
                  <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
                    <p className="text-gray-600">Map View</p>
                  </div>
                </div>
              )}

              {activeTab === 'similar' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Similar Properties</h2>
                  {similarLoading ? (
                    <div className="flex justify-center items-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : similarError ? (
                    <p className="text-red-600">{similarError}</p>
                  ) : similarHotels.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {similarHotels.map((hotel) => (
                        <div
                          key={hotel._id}
                          onClick={() => navigate(`/hotels/${hotel._id}`)}
                          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer"
                        >
                          <div className="h-40 bg-gray-200 relative">
                            {hotel.images && hotel.images.length > 0 ? (
                              <img
                                src={hotel.images[0]}
                                alt={hotel.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <FiHome className="h-12 w-12" />
                              </div>
                            )}
                            <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                              ${hotel.pricePerNight}/night
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="font-semibold text-gray-800 mb-1">{hotel.name}</h3>
                            <div className="flex items-center text-gray-600 text-sm mb-2">
                              <FiMapPin className="h-3 w-3 mr-1" />
                              {hotel.location}
                            </div>
                            <p className="text-gray-600 text-sm line-clamp-2">{hotel.description}</p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/hotels/${hotel._id}`);
                              }}
                              className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">No similar properties available</p>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={handleBookNow}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium text-lg mt-6"
            >
              Book Now
            </button>
          </div>
        </div>

        {bookingData.checkIn && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Book {hotel.name}</h3>
                <button
                  onClick={() => setBookingData({ checkIn: '', checkOut: '', rooms: 1 })}
                  className="text-gray-400 hover:text-gray-600"
                >
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
                    max={hotel.totalRooms}
                    value={bookingData.rooms}
                    onChange={(e) => setBookingData({ ...bookingData, rooms: parseInt(e.target.value) })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Price per night:</span>
                    <span className="font-medium">${hotel.pricePerNight}</span>
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

        {/* Photo Modal */}
        {showPhotoModal && hotel && hotel.images && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
            <div className="relative max-w-4xl w-full">
              {/* Close Button */}
              <button
                onClick={closePhotoModal}
                className="absolute -top-12 right-0 text-white text-2xl hover:text-gray-300"
              >
                <FiX className="h-8 w-8" />
              </button>

              {/* Main Image */}
              <div className="relative">
                <img
                  src={hotel.images[currentImageIndex]}
                  alt={`${hotel.name} - ${currentImageIndex + 1}`}
                  className="w-full h-120 object-contain rounded-lg"
                />
                
                {/* Previous Button */}
                {hotel.images.length > 1 && (
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full"
                  >
                    <FiChevronLeft className="h-6 w-6" />
                  </button>
                )}

                {/* Next Button */}
                {hotel.images.length > 1 && (
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full"
                  >
                    <FiChevronRight className="h-6 w-6" />
                  </button>
                )}
              </div>

              {/* Image Counter */}
              <div className="text-center text-white mt-4">
                {currentImageIndex + 1} / {hotel.images.length}
              </div>

              {/* Thumbnail Strip */}
              {hotel.images.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto justify-center ">
                  {hotel.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 ${
                        index === currentImageIndex ? 'border-blue-500' : 'border-transparent'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HotelDetails;

