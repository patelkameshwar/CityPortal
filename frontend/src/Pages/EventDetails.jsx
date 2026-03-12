import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await eventAPI.getById(id);
      setEvent(response.data.event);
    } catch (err) {
      setError('Event not found');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  if (error || !event) {
    return (
      <div className="py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Event Not Found</h1>
        <button 
          onClick={() => navigate('/events')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Back to Events
        </button>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-4xl mx-auto">
      <button 
        onClick={() => navigate('/events')}
        className="mb-8 bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition flex items-center gap-2"
      >
        ← Back to Events
      </button>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="h-96 bg-gradient-to-r from-purple-500 to-pink-500 relative">
          {event.images && event.images.length > 0 ? (
            <img src={event.images[0]} alt={event.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
              EVENT
            </div>
          )}
          <div className="absolute top-4 right-4 bg-white bg-opacity-90 px-4 py-2 rounded-full text-sm font-medium shadow-lg">
            ${event.price}/ticket
          </div>
        </div>

        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{event.title}</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                Location: {event.location}
              </div>
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                Time: {event.eventTime}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                Dates: {new Date(event.bookingFromDate).toLocaleDateString()} - {new Date(event.bookingToDate).toLocaleDateString()}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                Total Seats: {event.totalSeats}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span className="w-3 h-3 bg-indigo-500 rounded-full"></span>
                Organized by: {event.owner?.name || 'Unknown'}
              </div>
            </div>
          </div>

          <p className="text-gray-600 text-lg leading-relaxed mb-8">{event.description}</p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => isAuthenticated ? navigate(`/events/${id}/book`) : navigate('/login')}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700 transition shadow-lg flex-1 text-center"
            >
              Book Tickets
            </button>
            <button
              onClick={() => navigate('/events')}
              className="bg-gray-200 text-gray-800 px-8 py-3 rounded-xl font-medium hover:bg-gray-300 transition flex-1 text-center"
            >
              View All Events
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;

