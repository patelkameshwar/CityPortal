
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiLogOut, FiEdit2, FiSave } from 'react-icons/fi';

const MyProfile = () => {
  const { user, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  if (!user) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Please Login</h2>
        <p className="text-gray-600">You need to login to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
            <button
              onClick={() => setEditing(!editing)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2"
            >
              {editing ? <><FiSave className="h-4 w-4" /> Cancel</> : <><FiEdit2 className="h-4 w-4" /> Edit Profile</>}
            </button>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-center mb-6">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                <FiUser className="h-12 w-12 text-gray-600" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FiUser className="h-4 w-4" /> Name
              </label>
              {editing ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              ) : (
                <p className="text-gray-800 text-lg">{user.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FiMail className="h-4 w-4" /> Email
              </label>
              {editing ? (
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              ) : (
                <p className="text-gray-800 text-lg">{user.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
              <p className="text-gray-800 text-lg capitalize">{user.role}</p>
            </div>

            {editing && (
              <button
                onClick={() => {
                  alert('Profile updated successfully!');
                  setEditing(false);
                }}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center justify-center gap-2"
              >
                <FiSave className="h-4 w-4" /> Save Changes
              </button>
            )}

            <div className="pt-6 border-t">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium flex items-center justify-center gap-2"
              >
                <FiLogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;

