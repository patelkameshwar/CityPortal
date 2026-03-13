import React from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api.js';
import { FaUsers, FaHotel, FaMapMarkedAlt, FaCalendarAlt, FaChartBar, FaSignOutAlt } from 'react-icons/fa';
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

        // Client-side sort by createdAt desc, take top 5
        const sortRecent = (items) => (items || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

        setRecentClients(sortRecent(clientsRes.data.data));
        setRecentHotels(sortRecent(hotelsRes.data.hotels || hotelsRes.data.data || []));
        setRecentEvents(sortRecent(eventsRes.data.events || eventsRes.data.data || []));
        setRecentTourism(sortRecent(tourismRes.data.tourism || tourismRes.data.data || []));
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
        <div className={`p-2 rounded-lg ${color} mr-3`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
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
        ) : (
          items.map((item) => (
            <div key={item._id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{item.name || item.title || 'N/A'}</p>
{(item.email || item.phone || item.location) && (
                    <p className="text-xs text-gray-500 truncate mt-1">
                      {item.email && `${item.email}`}
                      {item.phone && (item.email ? ' | ' : '') + item.phone}
                      {item.location && !item.email && !item.phone ? item.location : ''}
                    </p>
                  )}
                </div>
                <span className="text-sm text-gray-500 ml-2 whitespace-nowrap">{formatDate(item.createdAt)}</span>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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

