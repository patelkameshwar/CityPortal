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

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats');
        console.log('Stats response:', response.data);
        if (response.data.success) {
          setStats([
            { name: 'Total Clients', value: response.data.data.totalClients?.toLocaleString() || '0', icon: FaUsers, color: 'bg-blue-500' },
            { name: 'Hotels', value: response.data.data.totalHotels?.toLocaleString() || '0', icon: FaHotel, color: 'bg-emerald-500' },
            { name: 'Tourism Spots', value: response.data.data.totalTourism?.toLocaleString() || '0', icon: FaMapMarkedAlt, color: 'bg-purple-500' },
            { name: 'Events', value: response.data.data.totalEvents?.toLocaleString() || '0', icon: FaCalendarAlt, color: 'bg-orange-500' },
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

  const { logout: contextLogout } = useAuth();
  const handleLogout = () => {
    contextLogout();
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
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
                <Link to="/tourism" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition">
                  <FaMapMarkedAlt className="h-5 w-5 text-purple-600 mr-3" />
                  Tourism Management
                </Link>
                <Link to="/events" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition">
                  <FaCalendarAlt className="h-5 w-5 text-orange-600 mr-3" />
                  Events Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

