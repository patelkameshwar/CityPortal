import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api.js";
import {
  FaCalendarAlt,
  FaEdit,
  FaTrash,
  FaSearch,
  FaEye,
} from "react-icons/fa";
import { toast } from "react-toastify";

const EventDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingEvent, setEditingEvent] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get("/events");
      console.log("Events API Response:", response.data);
      setEvents(
        response.data.events || response.data.data || response.data || [],
      );
    } catch (error) {
      toast.error("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this event?")) {
      try {
        const response = await api.delete(`/events/${id}`);
        if (response.data.success) {
          toast.success("Event deleted");
          fetchEvents();
        }
      } catch (error) {
        toast.error("Delete failed");
      }
    }
  };

  const filteredEvents = Array.isArray(events)
    ? events.filter(
        (event) =>
          (event?.title?.toLowerCase() || "").includes(search.toLowerCase()) ||
          (event?.location?.toLowerCase() || "").includes(search.toLowerCase()),
      )
    : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        Loading events...
      </div>
    );
  }

  const isOneDayEvent = (event) => !!event.eventDate;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Events</h1>
            <p className="text-gray-600 mt-1">View and manage all events</p>
          </div>
          <Link
            to="/admin-dashboard"
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-6">
            <FaSearch className="h-5 w-5 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search events by title or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

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
                    Owner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEvents.map((event) => (
                  <tr key={event._id} className="hover:bg-gray-50">
                    <td className="px-2 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {event.images && event.images[0] ? (
                          <img
                            src={event.images[0]}
                            alt={event.title}
                            className="h-12 w-12 rounded-lg object-cover mr-4"
                          />
                        ) : (
                          <div className="h-8 w-8 bg-orange-500 rounded-lg flex items-center justify-center mr-4">
                            <FaCalendarAlt className="h-8 text-white" />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {event.title}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isOneDayEvent(event) 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {isOneDayEvent(event) ? 'One day' : 'Multi-day'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {event.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        ₹ {event.price}/
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {event.eventDate
                        ? new Intl.DateTimeFormat("en-GB", {
                            day: "numeric",
                            month: "short",
                          }).format(new Date(event.eventDate))
                        : `${new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(new Date(event.bookingFromDate))} - ${new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(new Date(event.bookingToDate))}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {event.eventTime || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {event.totalSeats || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {event.owner?.name
                        ? event.owner.name.split(" ")[0]
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Link
                        to={`/admin/events/${event._id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <FaEye className="h-4 w-4 inline" />
                      </Link>
                      <button
                        onClick={() => setEditingEvent(event)}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        <FaEdit className="h-4 w-4 inline" />
                      </button>
                      <button
                        onClick={() => handleDelete(event._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash className="h-4 w-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <FaCalendarAlt className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No events found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search or add new events
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDashboard;
