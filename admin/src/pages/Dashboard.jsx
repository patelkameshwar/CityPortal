import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FaUserShield, FaUsers, FaHotel, FaCalendar, FaSignOutAlt, FaCity } from 'react-icons/fa';

const Dashboard = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/admin';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <FaCity className="text-white text-xl" />
              </div>
              <h1 className="text-xl font-bold text-gray-800">CityPortal Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-600">
                <span className="bg-blue-100 p-2 rounded-full">
                  <FaUserShield className="text-blue-600" />
                </span>
                <span className="font-medium">{user?.name}</span>
                <span className="text-sm text-gray-500">({user?.role})</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
              >
                <FaSignOutAlt />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            Welcome back, {user?.name}!
          </h2>
          <p className="text-gray-600 mt-1">
            Here's what's happening with your {user?.role} account.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Hotels</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">24</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <FaHotel className="text-2xl text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Events</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">12</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <FaCalendar className="text-2xl text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Clients</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">156</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <FaUsers className="text-2xl text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left">
              <FaHotel className="text-gray-400 text-xl mb-2" />
              <p className="font-medium text-gray-700">Manage Hotels</p>
              <p className="text-sm text-gray-500">Add, edit, or remove hotels</p>
            </button>
            <button className="p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition text-left">
              <FaCalendar className="text-gray-400 text-xl mb-2" />
              <p className="font-medium text-gray-700">Manage Events</p>
              <p className="text-sm text-gray-500">Create or update events</p>
            </button>
            <button className="p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition text-left">
              <FaUsers className="text-gray-400 text-xl mb-2" />
              <p className="font-medium text-gray-700">Manage Clients</p>
              <p className="text-sm text-gray-500">View client information</p>
            </button>
            <button className="p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left">
              <FaUserShield className="text-gray-400 text-xl mb-2" />
              <p className="font-medium text-gray-700">Admin Settings</p>
              <p className="text-sm text-gray-500">Configure system settings</p>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

