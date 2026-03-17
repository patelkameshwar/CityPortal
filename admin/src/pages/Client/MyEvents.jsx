import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { eventAPI } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  FaCalendarAlt,
  FaPlus,
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaSpinner,
  FaImage,
  FaMapMarkerAlt,
  FaDollarSign,
  FaEye,
  FaUser,
} from "react-icons/fa";
import { toast } from "react-toastify";

const MyEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      fetchClientEvents();
    }
  }, [isAuthenticated]);

  const fetchClientEvents = async () => {
    try {
      const response = await api.get("/client/events");
      setEvents(response.data.events || []);
    } catch (error) {
      console.error("Failed to fetch events:", error);
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (deleteLoading === id) return;
    if (!window.confirm("Are you sure?")) return;

    setDeleteLoading(id);
    try {
      await eventAPI.delete(id);
      toast.success("Event deleted");
      setEvents((prev) => prev.filter((e) => e._id !== id));
    } catch (error) {
      toast.error("Failed to delete event");
    } finally {
      setDeleteLoading(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center p-8">
          <FaCalendarAlt className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Please Login
          </h2>
          <Link
            to="/login"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link
                to="/client-dashboard"
                className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <FaArrowLeft />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Events</h1>
                <p className="text-gray-600">
                  View and manage all your CityPortal listed events
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 p-2 flex items-center justify-center flex-shrink-0 group-hover:ring-2 group-hover:ring-emerald-500 transition">
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user?.name || "Profile"}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <FaUser className="h-8 w-8 text-gray-500" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.name || "Client"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              All Listed Events ({events.length})
            </h3>
            <Link
              to="/client/add-event"
              className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium"
            >
              <FaPlus className="mr-2 h-4 w-4" />
              Add Event
            </Link>
          </div>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <FaSpinner className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <FaCalendarAlt className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No events listed
              </h3>
              <p className="text-gray-500 mb-6">
                Get started by adding your first event.
              </p>
              <Link
                to="/client/add-event"
                className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition shadow-sm"
              >
                Add Your First Event
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Venue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Available Dates
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Seats
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bookings
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {events.map((event) => {
                    const isOneDay = event.eventDate;
                    return (
                      <tr key={event._id} className="hover:bg-gray-50">
                        
                        <td className="px-2 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4 overflow-hidden">
                              {event.images && event.images[0] ? (
                                <img
                                  src={event.images[0]}
                                  alt={event.title}
                                  className="h-12 w-12 object-cover rounded-lg"
                                />
                              ) : (
                                <FaCalendarAlt className="h-8 text-gray-500" />
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {event.title}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            isOneDay
                              ? "bg-blue-100 text-blue-800"
                              : "bg-purple-100 text-purple-800"
                          }`}>
                            {isOneDay ? "One day" : "Multi-day"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            {event.location}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            ₹{event.price}/
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {event.eventDate 
                            ? new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(new Date(event.eventDate))
                            : `${new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(new Date(event.bookingFromDate))} - ${new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(new Date(event.bookingToDate))}`
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {event.eventTime}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {event.totalSeats}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <b>{event.bookingsCount || 0}</b> bookings
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link to={`/client/view-items/event/${event._id}`} className="text-blue-600 hover:text-blue-900">
                              <FaEye className="h-4 w-4 inline" />
                            </Link>
                            <button 
                              className="text-yellow-600 hover:text-yellow-900"
                              onClick={() => navigate(`/client/edit/event/${event._id}`)}
                            >
                              <FaEdit className="h-4 w-4 inline" />
                            </button>
                            <button
                              onClick={() => handleDelete(event._id)}
                              disabled={deleteLoading === event._id}
                              className="text-red-600 hover:text-red-900"
                            >
                              {deleteLoading === event._id ? (
                                <FaSpinner className="h-4 w-4 animate-spin" />
                              ) : (
                                <FaTrash className="h-4 w-4 inline" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyEvents;

