
import React, { useState, useEffect } from 'react';
import { bookingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiCalendar, FiMapPin, FiHome, FiX, FiUsers, FiDollarSign } from 'react-icons/fi';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelLoading, setCancelLoading] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyBookings();
    }
  }, [isAuthenticated]);

  const fetchMyBookings = async () => {
    try {
      const response = await bookingAPI.getMyBookings();
      setBookings(response.data.bookings || []);
    } catch (err) {
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    setCancelLoading(bookingId);
    try {
      await bookingAPI.cancel(bookingId);
      setBookings(bookings.map(booking => 
        booking._id === bookingId ? { ...booking, status: 'Cancelled' } : booking
      ));
      alert('Booking cancelled successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancelLoading(null);
    }
  };

  const getItemIcon = (itemType) => {
    switch (itemType) {
      case 'Hotel':
        return <FiHome className="h-5 w-5" />;
      case 'Event':
        return <FiCalendar className="h-5 w-5" />;
      case 'Tourism':
        return <FiMapPin className="h-5 w-5" />;
      default:
        return <FiCalendar className="h-5 w-5" />;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Please Login</h2>
        <p className="text-gray-600">You need to login to view your bookings.</p>
      </div>
    );
  }

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
        <h1 className="text-3xl font-bold text-gray-800">My Bookings</h1>
        <p className="text-gray-600 mt-2">View and manage your reservations</p>
      </div>

      {error && (
        <div className="max-w-4xl mx-auto mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'Confirmed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {booking.status}
                      </span>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        {getItemIcon(booking.itemType)}
                        {booking.itemType}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {booking.itemId?.name || booking.itemId?.title || 'Unknown Item'}
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <FiCalendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <span className="text-gray-500">Booking Date:</span>
                          <p className="text-gray-800">{formatDate(booking.bookingDate || booking.bookingFromDate)}</p>
                        </div>
                      </div>
                      {booking.bookingToDate && (
                        <div className="flex items-center gap-2">
                          <FiCalendar className="h-4 w-4 text-gray-400" />
                          <div>
                            <span className="text-gray-500">End Date:</span>
                            <p className="text-gray-800">{formatDate(booking.bookingToDate)}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <FiUsers className="h-4 w-4 text-gray-400" />
                        <div>
                          <span className="text-gray-500">Quantity:</span>
                          <p className="text-gray-800">{booking.totalQuantity} {booking.itemType === 'Hotel' ? 'room(s)' : 'ticket(s)'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiDollarSign className="h-4 w-4 text-gray-400" />
                        <div>
                          <span className="text-gray-500">Total Price:</span>
                          <p className="text-gray-800 font-semibold">${booking.totalPrice}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {booking.status === 'Confirmed' && (
                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        disabled={cancelLoading === booking._id}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition font-medium"
                      >
                        {cancelLoading === booking._id ? 'Cancelling...' : 'Cancel Booking'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FiCalendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">No bookings found</p>
            <p className="text-gray-400 mt-2">Start exploring hotels, events, and tourist spots!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;

