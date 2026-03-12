import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tourismAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const TourismDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [spot, setSpot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSpot();
  }, [id]);

  const fetchSpot = async () => {
    try {
      const response = await tourismAPI.getById(id);
      setSpot(response.data.tourism);
    } catch (err) {
      setError('Tourism spot not found');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div></div>;
  }

  if (error || !spot) {
    return (
      <div className="py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Tourism Spot Not Found</h1>
        <button 
          onClick={() => navigate('/tourism')}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
        >
          Back to Tourism
        </button>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-4xl mx-auto">
      <button 
        onClick={() => navigate('/tourism')}
        className="mb-8 bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition flex items-center gap-2"
      >
        ← Back to Tourism
      </button>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="h-96 bg-gradient-to-r from-green-500 to-emerald-500 relative">
          {spot.images && spot.images.length > 0 ? (
            <img src={spot.images[0]} alt={spot.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
              EXPLORE
            </div>
          )}
          <div className="absolute top-4 right-4 bg-white bg-opacity-90 px-4 py-2 rounded-full text-sm font-medium shadow-lg">
            ${spot.entryFee}/person
          </div>
        </div>

        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{spot.name}</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                Location: {spot.location}
              </div>
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                Open: {spot.openTime} - {spot.closeTime}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                Visitors/Day: {spot.totalVisitors}
              </div>
            </div>
          </div>

          <p className="text-gray-600 text-lg leading-relaxed mb-8">{spot.description}</p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => isAuthenticated ? navigate(`/tourism/${id}/book`) : navigate('/login')}
              className="bg-green-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-green-700 transition shadow-lg flex-1 text-center"
            >
              Book Visit
            </button>
            <button
              onClick={() => navigate('/tourism')}
              className="bg-gray-200 text-gray-800 px-8 py-3 rounded-xl font-medium hover:bg-gray-300 transition flex-1 text-center"
            >
              View All Spots
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourismDetails;

