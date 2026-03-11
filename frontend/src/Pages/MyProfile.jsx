
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { FiUser, FiMail, FiLogOut, FiEdit2, FiSave, FiPhone, FiMapPin } from 'react-icons/fi';

const MyProfile = () => {
  const { user, logout, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [gender, setGender] = useState(user?.gender || '');
  const [birthday, setBirthday] = useState(user?.birthday ? user.birthday.split('T')[0] : '');
  const [saving, setSaving] = useState(false);

  // Sync state with user data when it changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
      setGender(user.gender || '');
      setBirthday(user.birthday ? user.birthday.split('T')[0] : '');
    }
  }, [user]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await authAPI.updateProfile({ 
        name, 
        phone, 
        address, 
        gender, 
        birthday: birthday ? new Date(birthday) : null 
      });
      if (response.data.success) {
        updateUser(response.data.user);
        alert('Profile updated successfully!');
        setEditing(false);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

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
                <p className="text-gray-800 text-lg">{user.name || 'Not set'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FiMail className="h-4 w-4" /> Email ID
              </label>
              <p className="text-gray-800 text-lg">{user.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FiPhone className="h-4 w-4" /> Phone
              </label>
              {editing ? (
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              ) : (
                <p className="text-gray-800 text-lg">{user.phone || 'Not set'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FiMapPin className="h-4 w-4" /> Address
              </label>
              {editing ? (
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter address"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              ) : (
                <p className="text-gray-800 text-lg">{user.address || 'Not set'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
              {editing ? (
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              ) : (
                <p className="text-gray-800 text-lg capitalize">{user.gender || 'Not set'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Birthday</label>
              {editing ? (
                <input
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              ) : (
                <p className="text-gray-800 text-lg">
                  {user.birthday ? new Date(user.birthday).toLocaleDateString() : 'Not set'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
              <p className="text-gray-800 text-lg capitalize">{user.role}</p>
            </div>

            {editing && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center justify-center gap-2 disabled:bg-green-400"
              >
                <FiSave className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Changes'}
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

