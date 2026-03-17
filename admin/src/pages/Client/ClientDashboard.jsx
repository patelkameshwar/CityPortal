import React from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api.js';
import { FaUsers, FaHotel, FaMapMarkedAlt, FaCalendarAlt, FaChartBar, FaSignOutAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';


const ClientDashboard = () => {
  const [stats, setStats] = React.useState([
    { name: 'Your Hotels', value: '0', icon: FaHotel, color: 'bg-emerald-500' },
    { name: 'Active Bookings', value: '0', icon: FaCalendarAlt, color: 'bg-orange-500' },
    { name: 'Events Hosted', value: '0', icon: FaMapMarkedAlt, color: 'bg-purple-500' },
    { name: 'Monthly Revenue', value: '$0', icon: FaChartBar, color: 'bg-blue-500' },
  ]);
  const [chartData, setChartData] = React.useState([]);
  const [chartLoading, setChartLoading] = React.useState(true);
  const [currentPeriod, setCurrentPeriod] = React.useState('day'); // day, month, year
  const [loading, setLoading] = React.useState(true);



React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/client/stats');
        console.log('Client stats response:', response.data);
        if (response.data.success) {
          const statsData = response.data.data || response.data.stats || {};
          setStats([
    { name: 'Your Hotels', value: statsData.hotels?.toLocaleString() || '0', icon: FaHotel, color: 'bg-emerald-500' },
            { name: 'Active Bookings', value: statsData.bookings?.toLocaleString() || '0', icon: FaCalendarAlt, color: 'bg-orange-500' },
            { name: 'Events Hosted', value: statsData.events?.toLocaleString() || '0', icon: FaMapMarkedAlt, color: 'bg-purple-500' },
            { name: 'Monthly Revenue', value: `$${statsData.revenue?.toLocaleString() || '0'}`, icon: FaChartBar, color: 'bg-blue-500' },
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

  React.useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setChartLoading(true);
        const response = await api.get(`/client/analytics?period=${currentPeriod}`);
        console.log('Client analytics response:', response.data);
        if (response.data.success) {
          setChartData(response.data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
        toast.error('Failed to load analytics data');
      } finally {
        setChartLoading(false);
      }
    };
    fetchAnalytics();
  }, [currentPeriod]);



  const { logout: contextLogout } = useAuth();
  const formatMonthYear = (value) => {
    let date;
    if (typeof value === 'string') {
      if (value.includes('-')) {
        date = new Date(value + (value.length === 7 ? '-01' : ''));
      } else if (/\d{4}/.test(value)) {
        date = new Date(value);
      } else {
        return value;
      }
    } else if (value instanceof Date) {
      date = value;
    }
    
    if (!date || isNaN(date.getTime())) return value;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      year: '2-digit' 
    });
  };

  const handleLogout = () => {
    contextLogout();
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Client Dashboard</h1>
              <p className="text-gray-600">Welcome back, Client! Manage your CityPortal services.</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 font-semibold">Client Mode</span>
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

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 bg-white shadow rounded-lg">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Active Bookings & Revenue</h3>
                <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
                  {['day', 'month', 'year'].map((period) => (
                    <button
                      key={period}
                      onClick={() => setCurrentPeriod(period)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        currentPeriod === period
                          ? 'bg-white shadow-sm text-gray-900'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {period.charAt(0).toUpperCase() + period.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                {currentPeriod === 'day' ? 'Last 30 days' : currentPeriod === 'month' ? 'Last 12 months' : 'Last 5 years'}
              </p>

              <div style={{ width: '100%', height: 300 }}>
                {chartLoading ? (
                  <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-gray-500">Loading chart...</div>
                  </div>
                ) : chartData.length === 0 ? (
                  <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center text-gray-500">
                      <FaChartBar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No analytics data available</p>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" tickFormatter={formatMonthYear} />
                      <YAxis yAxisId="left" orientation="left" stroke="#2563eb" />
                      <YAxis yAxisId="right" orientation="right" stroke="#059669" />
                      <Tooltip />
                      <Legend />
                      <Line 
                        yAxisId="left" 
                        type="monotone" 
                        dataKey="activeBookings" 
                        stroke="#2563eb" 
                        name="Active Bookings"
                        strokeWidth={3}
                      />
                      <Line 
                        yAxisId="right" 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#059669" 
                        name="Revenue ($)"
                        strokeWidth={3}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Quick Actions</h3>
              <div className="space-y-3">
                <Link to="/client/view-profile" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition">
                  <FaUsers className="h-5 w-5 text-blue-600 mr-3" />
                  View Profile
                </Link>
                <Link to="/client/my-hotels" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition">
                  <FaHotel className="h-5 w-5 text-emerald-600 mr-3" />
                  My Hotels
                </Link>
                <Link to="/my-bookings" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition">
                  <FaCalendarAlt className="h-5 w-5 text-orange-600 mr-3" />
                  Manage Bookings
                </Link>
                <Link to="/client/my-events" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition">
                  <FaCalendarAlt className="h-5 w-5 text-purple-600 mr-3" />
                  My Events
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;

