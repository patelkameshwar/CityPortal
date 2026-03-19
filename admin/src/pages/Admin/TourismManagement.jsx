import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api.js';
import { FaMapMarkedAlt, FaEdit, FaTrash, FaSearch, FaEye, FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';

const TourismManagement = () => {
  const [tourism, setTourism] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingTourism, setEditingTourism] = useState(null);

  useEffect(() => {
    fetchTourism();
  }, []);

  const fetchTourism = async () => {
    try {
      const response = await api.get('/tourism');
      console.log('Tourism API Response:', response.data);
      setTourism(response.data.tourismPlaces || response.data.data || response.data || []);
    } catch (error) {
      toast.error('Failed to fetch tourism');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this tourism spot?')) {
      try {
        const response = await api.delete(`/tourism/${id}`);
        if (response.data.success) {
          toast.success('Tourism spot deleted');
          fetchTourism();
        }
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  const filteredTourism = Array.isArray(tourism) ? tourism.filter(spot => 
    (spot?.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (spot?.location?.toLowerCase() || '').includes(search.toLowerCase())
  ) : [];

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">Loading tourism spots...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Tourism</h1>
            <p className="text-gray-600 mt-1">View and manage all tourism spots</p>
          </div>
          <Link to="/admin-dashboard" className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition">
            ← Back to Dashboard
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <FaSearch className="h-5 w-5 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search tourism by name or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-[1000px]"
              />
            </div>
            <Link to="/admin/add-tourism" className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium shadow-sm">
              <FaPlus className="mr-2 h-4 w-4" />
              Add Tourism
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entry Fee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Working Hours</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">V/D</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTourism.map((spot) => (
                  <tr key={spot._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {spot.images && spot.images[0] ? (
                          <img src={spot.images[0]} alt={spot.name} className="h-12 w-12 rounded-lg object-cover mr-4" />
                        ) : (
                          <div className="h-8 w-8 bg-purple-500 rounded-lg flex items-center justify-center mr-4">
                            <FaMapMarkedAlt className="h-6 w-6 text-white" />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{spot.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{spot.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        ₹ {spot.entryFee}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{spot.openTime} - {spot.closeTime}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(spot.bookingFromDate))} - {new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(spot.bookingToDate))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{spot.totalVisitors}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{spot.owner?.name ? spot.owner.name.split(' ')[0] : 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Intl.DateTimeFormat('en-GB', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      }).format(new Date(spot.createdAt))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Link to={`/admin/view/tourism/${spot._id}`} className="text-blue-600 hover:text-blue-900">
                        <FaEye className="h-4 w-4 inline" />
                      </Link>
                      <button onClick={() => setEditingTourism(spot)} className="text-yellow-600 hover:text-yellow-900">
                        <FaEdit className="h-4 w-4 inline" />
                      </button>
                      <button onClick={() => handleDelete(spot._id)} className="text-red-600 hover:text-red-900">
                        <FaTrash className="h-4 w-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTourism.length === 0 && (
            <div className="text-center py-12">
              <FaMapMarkedAlt className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tourism spots found</h3>
              <p className="text-gray-500">Try adjusting your search or add new spots</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TourismManagement;

