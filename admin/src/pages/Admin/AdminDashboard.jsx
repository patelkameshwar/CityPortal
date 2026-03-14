import React from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api.js';
import { FaUsers, FaHotel, FaMapMarkedAlt, FaCalendarAlt, FaChartBar, FaSignOutAlt, FaEye, FaUserEdit, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext.jsx';

const AdminDashboard = () => {
  const [stats, setStats] = React.useState([
    { name: 'Total Clients', value: '0', icon: FaUsers, color: 'bg-blue-500' },
    { name: 'Hotels', value: '0', icon: FaHotel, color: 'bg-emerald-500' },
    { name: 'Tourism Spots', value: '0', icon: FaMapMarkedAlt, color: 'bg-purple-500' },
    { name: 'Events', value: '0', icon: FaCalendarAlt, color: 'bg-orange-500' },
  ]);
  const [loading, setLoading] = React.useState(true);

  // Recent data states
  const [recentClients, setRecentClients] = React.useState([]);
  const [recentHotels, setRecentHotels] = React.useState([]);
  const [recentEvents, setRecentEvents] = React.useState([]);
  const [recentTourism, setRecentTourism] = React.useState([]);
  const [recentLoading, setRecentLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats');
        console.log('Stats response:', response.data);
        if (response.data.success) {
          setStats([
            { name: 'Total Clients', value: (response.data.stats?.totalClients || 0).toLocaleString(), icon: FaUsers, color: 'bg-blue-500' },
            { name: 'Hotels', value: (response.data.stats?.totalHotels || 0).toLocaleString(), icon: FaHotel, color: 'bg-emerald-500' },
            { name: 'Tourism Spots', value: (response.data.stats?.totalTourism || 0).toLocaleString(), icon: FaMapMarkedAlt, color: 'bg-purple-500' },
            { name: 'Events', value: (response.data.stats?.totalEvents || 0).toLocaleString(), icon: FaCalendarAlt, color: 'bg-orange-500' },
          ]);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Fetch recent data using general endpoints + client-side sorting
  React.useEffect(() => {
    const fetchRecent = async () => {
      setRecentLoading(true);
      try {
        const [clientsRes, hotelsRes, eventsRes, tourismRes] = await Promise.all([
          api.get('/admin/clients'),
          api.get('/hotels'),
          api.get('/events'),
          api.get('/tourism')
        ]);

        const sortRecent = (items) => (items || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);

        setRecentClients(sortRecent(clientsRes.data.data));
        setRecentHotels(sortRecent(hotelsRes.data.hotels || hotelsRes.data.data || []));
        setRecentEvents(sortRecent(eventsRes.data.events || eventsRes.data.data || eventsRes.data || []));
        setRecentTourism(sortRecent(tourismRes.data.tourism || tourismRes.data.tourismPlaces || tourismRes.data.data || []));
      } catch (error) {
        console.error('Failed to fetch recent data:', error);
        toast.error('Failed to load recent additions - check backend endpoints');
      } finally {
        setRecentLoading(false);
      }
    };
    fetchRecent();
  }, []);

  const { logout: contextLogout } = useAuth();
  const handleLogout = () => {
    contextLogout();
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const RecentList = ({ title, items, icon: Icon, color }) => (
    <div>
      <div className="flex items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
        {recentLoading ? (
          <div className="p-6 space-y-3">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No recent {title.toLowerCase()}
          </div>
        ) : title === "Recent Clients" ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.address || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.phone || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Intl.DateTimeFormat('en-GB', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      }).format(new Date(item.createdAt))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Link to={`/admin/clients/${item._id}`} className="text-blue-600 hover:text-blue-900">
                        <FaEye className="h-4 w-4 inline" />
                      </Link>
                      <Link to={`/admin/hotels/${item._id}/edit`} className="text-yellow-600 hover:text-yellow-900">
                        <FaUserEdit className="h-4 w-4 inline" />
                      </Link>
                      <button 
                        onClick={async () => {
                          if (window.confirm('Delete this client?')) {
                            try {
                              await api.delete(`/admin/clients/${item._id}`);
                              toast.success('Client deleted');
                              window.location.reload();
                            } catch (error) {
                              toast.error('Delete failed');
                            }
                          }
                        }} 
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash className="h-4 w-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : title === "Recent Events" ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available Dates</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seats</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((event) => (
                  <tr key={event._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{event.title}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        event.eventDate 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {event.eventDate ? 'One day' : 'Multi-day'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{event.location}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        ₹ {event.price}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {event.eventDate
                        ? new Intl.DateTimeFormat('en-GB', {
                            day: 'numeric',
                            month: 'short',
                          }).format(new Date(event.eventDate))
                        : `${new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(event.bookingFromDate))} - ${new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(event.bookingToDate))}`}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{event.eventTime}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{event.totalSeats || 'N/A'}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(event.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Link to={`/admin/events/${event._id}`} className="text-blue-600 hover:text-blue-900">
                        <FaEye className="h-4 w-4 inline" />
                      </Link>
                      <Link to={`/admin/events/${event._id}/edit`} className="text-yellow-600 hover:text-yellow-900">
                        <FaUserEdit className="h-4 w-4 inline" />
                      </Link>
                      <button 
                        onClick={async () => {
                          if (window.confirm('Delete this event?')) {
                            try {
                              await api.delete(`/events/${event._id}`);
                              toast.success('Event deleted');
                              window.location.reload();
                            } catch (error) {
                              toast.error('Delete failed');
                            }
                          }
                        }} 
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash className="h-4 w-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : title === "Recent Tourism" ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entry Fee</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Limit</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((spot) => (
                  <tr key={spot._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{spot.name}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{spot.location}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        ₹{spot.entryFee || 0}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(spot.bookingFromDate))} - {new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(spot.bookingToDate))}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {spot.openTime}-{spot.closeTime}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{spot.totalVisitors || 'N/A'}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(spot.createdAt)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium space-x-1">
                      <Link to={`/admin/tourism/${spot._id}`} className="text-blue-600 hover:text-blue-900">
                        <FaEye className="h-4 w-4 inline" />
                      </Link>
                      <Link to={`/admin/tourism/${spot._id}/edit`} className="text-yellow-600 hover:text-yellow-900">
                        <FaUserEdit className="h-4 w-4 inline" />
                      </Link>
                      <button 
                        onClick={async () => {
                          if (window.confirm('Delete this tourism spot?')) {
                            try {
                              await api.delete(`/tourism/${spot._id}`);
                              toast.success('Tourism spot deleted');
                              window.location.reload();
                            } catch (error) {
                              toast.error('Delete failed');
                            }
                          }
                        }} 
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash className="h-4 w-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : title === "Recent Hotels" ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rooms</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.location || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.totalRooms || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"><span className="text-sm font-medium bg-green-100 text-green-800 px-2 py-1 rounded-full">₹ {item.pricePerNight || 'N/A'}</span></td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {item.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Intl.DateTimeFormat('en-GB', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      }).format(new Date(item.createdAt))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Link to={`/hotels/${item._id}`} className="text-blue-600 hover:text-blue-900">
                        <FaEye className="h-4 w-4 inline" />
                      </Link>
                      <Link to={`/admin/hotels/${item._id}/edit`} className="text-yellow-600 hover:text-yellow-900">
                        <FaUserEdit className="h-4 w-4 inline" />
                      </Link>
                      <button 
                        onClick={async () => {
                          if (window.confirm('Delete this hotel?')) {
                            try {
                              await api.delete(`/admin/hotels/${item._id}`);
                              toast.success('Hotel deleted');
                              // Refresh data
                              window.location.reload();
                            } catch (error) {
                              toast.error('Delete failed');
                            }
                          }
                        }} 
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash className="h-4 w-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          items.map((item) => (
            <div key={item._id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.title || item.name || 'Untitled'}
                  </p>
                  <p className="text-xs text-gray-500 truncate mt-1">
                    {item.location || 'No location'} • {formatDate(item.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}

      </div>
    </div>
  );

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back, Admin! Manage CityPortal.</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Admin Mode</span>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium shadow-sm"
              >
                <FaSignOutAlt className="mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className={`p-3 rounded-lg ${stat.color}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                        <dd className="text-lg font-bold text-gray-900">{stat.value}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts & Main Content */}
        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Chart Placeholder */}
          <div className="lg:col-span-2 bg-white shadow rounded-lg">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <FaChartBar className="h-12 w-12 mx-auto mb-4" />
                  <p>Analytics chart will appear here</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Quick Actions</h3>
              <div className="space-y-3">
                <Link to="/admin/clients" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition">
                  <FaUsers className="h-5 w-5 text-blue-600 mr-3" />
                  Manage Clients
                </Link>
                <Link to="/admin/hotels" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition">
                  <FaHotel className="h-5 w-5 text-emerald-600 mr-3" />
                  Manage Hotels
                </Link>
                <Link to="/admin/tourism" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition">
                  <FaMapMarkedAlt className="h-5 w-5 text-purple-600 mr-3" />
                  Tourism Management
                </Link>
                <Link to="/admin/events" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition">
                  <FaCalendarAlt className="h-5 w-5 text-orange-600 mr-3" />
                  Events Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Additions Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Recent Additions</h2>
          <div className="grid grid-cols-1 gap-8">
            <RecentList 
              title="Recent Clients" 
              items={recentClients} 
              icon={FaUsers} 
              color="bg-blue-500" 
            />
            <div className="space-y-6">
              <RecentList 
                title="Recent Hotels" 
                items={recentHotels} 
                icon={FaHotel} 
                color="bg-emerald-500" 
              />
              <RecentList 
                title="Recent Events" 
                items={recentEvents} 
                icon={FaCalendarAlt} 
                color="bg-orange-500" 
              />
              <RecentList 
                title="Recent Tourism" 
                items={recentTourism} 
                icon={FaMapMarkedAlt} 
                color="bg-purple-500" 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

