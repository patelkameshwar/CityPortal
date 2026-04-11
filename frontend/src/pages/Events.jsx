
import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { eventAPI, bookingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiSearch, FiMapPin, FiCalendar, FiX, FiUser } from 'react-icons/fi';

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatEventDate = (fromDate, toDate) => {
  if (!fromDate || !toDate) return "";
  const from = new Date(fromDate);
  const to = new Date(toDate);

  if (
    from.getFullYear() !== to.getFullYear() ||
    from.getMonth() !== to.getMonth() ||
    from.getDate() !== to.getDate()
  ) {
    // Multi-day: "12 Jun - 20 Jun"
    const fromStr = from.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });
    const toStr = to.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });
    return `${fromStr} - ${toStr}`;
  } else {
    // Single day: "12 June"
    return from.toLocaleDateString("en-GB", { day: "numeric", month: "long" });
  }
};

const parseEventTime = (timeStr) => {
  timeStr = timeStr.toUpperCase().trim();
  let hours = 0, mins = 0;
  const isPM = timeStr.includes('PM');
  const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})/);
  if (timeMatch) {
    hours = parseInt(timeMatch[1]);
    mins = parseInt(timeMatch[2]);
    if (isPM && hours !== 12) hours += 12;
  }
  return hours * 60 + mins;
};

const isPastEvent = (event) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of today
  const now = new Date(); // Current time

  const endDateStr = event.bookingToDate || event.bookingFromDate || event.eventDate;
  if (!endDateStr) return true;

  const endDate = new Date(endDateStr);
  endDate.setHours(0, 0, 0, 0); // Normalize end date

  if (endDate < today) return true; // Past date
  if (endDate > today) return false; // Future date

  // Same day: compare times
  const eventTimeMins = parseEventTime(event.eventTime || '00:00');
  const currentMins = now.getHours() * 60 + now.getMinutes();
  return eventTimeMins <= currentMins; // Past or ongoing
};

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [bookingData, setBookingData] = useState({
    date: '',
    tickets: 1,
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState('');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await eventAPI.getAll();
      setEvents(response.data.events || []);
    } catch (err) {
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

const filteredEvents = events
  .filter((event) => !isPastEvent(event))
  .filter((event) =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBookNow = (event) => {
    if (!isAuthenticated) {
      toast.error('Please login to book event tickets');
      return;
    }
    setSelectedEvent(event);
    const defaultDate = event?.bookingFromDate ? new Date(event.bookingFromDate).toISOString().split('T')[0] : getTodayDate();
    setBookingData({
      date: defaultDate,
      tickets: 1,
    });
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    setBookingSuccess('');

    try {
      const totalPrice = selectedEvent.price * bookingData.tickets;

      await bookingAPI.create({
        itemType: 'Event',
        itemId: selectedEvent._id,
        bookingDate: bookingData.date,
        totalQuantity: bookingData.tickets,
        totalPrice,
      });

      toast.success('Event tickets booked successfully!');
      setTimeout(() => {
        setSelectedEvent(null);
        setBookingSuccess('');
        navigate("/my-bookings");
      }, 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!selectedEvent) return 0;
    return selectedEvent.price * bookingData.tickets;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="py-6 sm:py-8 px-2 sm:px-0">
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Upcoming Events</h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">Discover exciting events happening in the city</p>
      </div>

      <div className="max-w-xl mx-auto mb-6 sm:mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search events by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 sm:px-5 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
          <FiSearch className="absolute right-4 top-3 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {error && (
        <div className="max-w-4xl mx-auto mb-4 p-3 text-sm bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto px-2 sm:px-0">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <div 
              key={event._id} 
              onClick={() => navigate(`/events/${event._id}`)}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden"
            >
              <div className="h-40 sm:h-44 md:h-48 bg-gray-200 relative overflow-hidden">
                {event.images && event.images.length > 0 ? (
                  <img src={event.images[0]} alt={event.title} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105  cursor-pointer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <FiCalendar className="h-12 w-12 sm:h-16 sm:w-16" />
                  </div>
                )}
                <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold shadow">
                  ${event.price}
                  <span className="text-[10px] sm:text-xs ml-1 text-gray-200">
                    /ticket
                  </span>
                </div>
              </div>
              
              <div className="p-3 sm:p-4">
                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 mb-1 line-clamp-1">{event.title}</h3>
                <div className="flex items-center text-gray-600 mb-1 sm:mb-2 text-xs sm:text-sm">
                  <FiMapPin className="h-4 w-4 mr-1" />
                  {event.location}
                </div>
                <div className="flex items-center text-gray-600 mb-1 sm:mb-2 text-xs sm:text-sm">
                  <FiCalendar className="h-4 w-4 mr-1" />
                  {event.eventTime}
                </div>
                <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">{event.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 border px-3 py-1 rounded-full whitespace-nowrap">{event.totalSeats} Seats</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBookNow(event);
                    }}
                    className=" bg-blue-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg hover:bg-blue-700 transition cursor-pointer whitespace-nowrap"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <p className="text-gray-500 text-lg">No events found</p>
          </div>
        )}
      </div>

      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800">Book {selectedEvent.title}</h3>
              <button onClick={() => setSelectedEvent(null)} className="text-gray-400 hover:text-gray-600">
                <FiX className="h-6 w-6" />
              </button>
            </div>

            {bookingSuccess && (
              <div className="mb-4 p-3 text-sm bg-green-100 border border-green-400 text-green-700 rounded">
                {bookingSuccess}
              </div>
            )}

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Date</label>
                <input
                  type="date"
                  value={bookingData.date}
                  onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                  required
                  min={selectedEvent?.bookingFromDate ? new Date(selectedEvent.bookingFromDate).toISOString().split('T')[0] : getTodayDate()}
                  max={selectedEvent?.bookingToDate ? new Date(selectedEvent.bookingToDate).toISOString().split('T')[0] : ''}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Available: {formatEventDate(selectedEvent?.bookingFromDate, selectedEvent?.bookingToDate)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Tickets</label>
                <input
                  type="number"
                  min="1"
                  max={selectedEvent.totalSeats}
                  value={bookingData.tickets}
                  onChange={(e) => setBookingData({ ...bookingData, tickets: parseInt(e.target.value) })}
                  required
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg  focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="bg-gray-50 border border-gray-300 rounded-xl p-3 sm:p-4 space-y-2 text-sm sm:text-base">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Price per ticket:</span>
                  <span className="font-medium text-gray-800">${selectedEvent.price}</span>
                </div>
                <div className="border-t pt-2 flex justify-between items-center text-sm mt-2">
                  <span className="text-gray-700 font-medium">Total:</span>
                  <span className="font-bold text-lg text-gray-800">${calculateTotal()}</span>
                </div>
              </div>
              <button
                type="submit"
                disabled={bookingLoading}
                className="w-full bg-blue-600 text-white py-2.5 sm:py-3 text-sm sm:text-base rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-medium"
              >
                {bookingLoading ? 'Processing...' : 'Confirm Booking'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;

