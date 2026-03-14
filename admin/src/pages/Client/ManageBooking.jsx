import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { bookingAPI } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { FaCalendarAlt, FaHotel, FaMapMarkedAlt, FaChartBar, FaArrowLeft, FaSpinner, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ManageBooking = () => {
  const [bookings, setBookings] = useState([]);
  const [filterType, setFilterType] = useState('All');
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    cancelled: 0
  });
  const [cancelLoading, setCancelLoading] = useState(null);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    calculateStats(bookings);
  }, [bookings]);

  const fetchBookings = async () => {
    try {
      const response = await bookingAPI.getClientBookings();
      const fetchedBookings = response.data.bookings || response.data || [];
      setBookings(fetchedBookings);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
      setStatsLoading(false);
    }
  };

  const filteredBookings = filterType === 'All' ? bookings :
    (['Hotel', 'Event', 'Tourism'].includes(filterType) ? bookings.filter(b => b.itemType === filterType) : bookings.filter(b => b.status === filterType));

  const calculateStats = (bookingList) => {
    const total = bookingList.length;
    const active = bookingList.filter(b => b.status === 'Confirmed').length;
    const cancelled = bookingList.filter(b => b.status === 'Cancelled').length;
    setStats({ total, active, cancelled });
  };

  const handleCancelBooking = async (bookingId) => {
    if (cancelLoading === bookingId) return;
    setCancelLoading(bookingId);
    try {
      await bookingAPI.cancel(bookingId);
      setBookings(prev => prev.map(b => 
        b._id === bookingId ? { ...b, status: 'Cancelled' } : b
      ));
      calculateStats(bookings.map(b => b._id === bookingId ? { ...b, status: 'Cancelled' } : b));
      toast.success('Booking cancelled successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancelLoading(null);
    }
  };

  const getItemIcon = (itemType) => {
    switch (itemType) {
      case 'Hotel':
        return FaHotel;
      case 'Event':
        return FaCalendarAlt;
      case 'Tourism':
        return FaMapMarkedAlt;
      default:
        return FaCalendarAlt;
    }
  };

  const formatDate = (dateStr) => {
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(dateStr));
  };

  const getStatusBadge = (status) => {
    const colors = {
      Confirmed: 'bg-green-100 text-green-800',
      Cancelled: 'bg-red-100 text-red-800',
      Pending: 'bg-yellow-100 text-yellow-800'
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>{status}</span>;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center p-8">
          <FaCalendarAlt className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Please Login</h2>
          <p className="text-gray-600 mb-6">Log in to manage your bookings.</p>
          <Link to="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link to="/client-dashboard" className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition">
                <FaArrowLeft />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Manage Bookings</h1>
                <p className="text-gray-600">View and manage all your CityPortal bookings</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 font-semibold">Client: {user?.name || 'Client'}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        {statsLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setFilterType('All')}>
              <div className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-gray-500">
                    <FaChartBar className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Bookings</dt>
                      <dd className="text-lg font-bold text-gray-900">{stats.total}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setFilterType('Confirmed')}>
              <div className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-orange-500">
                    <FaCalendarAlt className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Active</dt>
                      <dd className="text-lg font-bold text-gray-900">{stats.active}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setFilterType('Cancelled')}>
              <div className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-red-500">
                    <FaTimes className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Cancelled</dt>
                      <dd className="text-lg font-bold text-gray-900">{stats.cancelled}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bookings Table */}
        <div className="mt-8 bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h3 className="text-lg font-medium text-gray-900">All Bookings</h3>
              <div className="flex items-center space-x-2">
                <label htmlFor="filter-type" className="text-sm font-semibold text-gray-800">Filter:</label>
                <select
                  id="filter-type"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base bg-gray-50 border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-lg"
                >
                  <option value="All">All</option>
                  <option value="Hotel">Hotel</option>
                  <option value="Event">Event</option>
                  <option value="Tourism">Tourism</option>
                </select>
              </div>
            </div>
          </div>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <FaSpinner className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <FaCalendarAlt className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No {filterType.toLowerCase()} bookings found</h3>
              <p className="text-gray-500">Try adjusting your filter or check back later.</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12">
              <FaCalendarAlt className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-500">Your bookings will appear here once you make reservations.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Dates</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Quantity / Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBookings.map((booking) => {
                    const Icon = getItemIcon(booking.itemType || booking.itemId?.type);
                    const name = booking.itemId?.name || booking.itemId?.title || 'Unknown';
                    const image = booking.itemId?.images?.[0];
                    const fromDate = formatDate(booking.bookingFromDate || booking.bookingDate);
                    const toDate = booking.bookingToDate ? ` - ${formatDate(booking.bookingToDate)}` : '';
                    return (
                      <tr key={booking._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center mr-4 overflow-hidden">
                              {image ? (
                                <img src={image} alt={name} className="h-full w-full object-cover" />
                              ) : (
                                <Icon className="h-6 w-6 text-gray-500" />
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{name}</div>
                              <div className="flex items-center text-xs text-gray-500">
                                <Icon className="h-4 w-4 mr-1" />
                                {booking.itemType}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden sm:table-cell">
                          {fromDate}{toDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell">
                          <div>{booking.totalQuantity || 1} {booking.itemType === 'Hotel' ? 'room(s)' : 'ticket(s)'}</div>
                          <div className="font-medium text-orange-600">${booking.totalPrice || 0}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(booking.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {booking.status === 'Confirmed' && (
                            <button
                              onClick={() => handleCancelBooking(booking._id)}
                              disabled={cancelLoading === booking._id}
                              className="text-red-600 hover:text-red-900 mr-3 disabled:opacity-50"
                            >
                              {cancelLoading === booking._id ? (
                                <FaSpinner className="h-4 w-4 animate-spin inline" />
                              ) : (
                                'Cancel'
                              )}
                            </button>
                          )}
                          {booking.status === 'Cancelled' && (
                            <span className="text-gray-500">Cancelled</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageBooking;

