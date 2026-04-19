import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { tourismAPI, bookingAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { FiSearch, FiMapPin, FiClock, FiX, FiUsers } from "react-icons/fi";

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const Tourism = () => {
  const [tourismSpots, setTourismSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [bookingData, setBookingData] = useState({
    date: "",
    visitors: 1,
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState("");
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTourismSpots();
  }, []);

  const fetchTourismSpots = async () => {
    try {
      const response = await tourismAPI.getAll();
      setTourismSpots(response.data.tourismPlaces || []);
    } catch (err) {
      setError("Failed to load tourism spots");
    } finally {
      setLoading(false);
    }
  };

  const filteredSpots = tourismSpots.filter(
    (spot) =>
      spot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      spot.location.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleBookNow = (spot) => {
    if (!isAuthenticated) {
      toast.error("Please login to book your visit");
      return;
    }
    setSelectedSpot(spot);
    setBookingData({
      date: getTodayDate(),
      visitors: 1,
    });
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    setBookingSuccess("");

    try {
      const totalPrice = selectedSpot.entryFee * bookingData.visitors;

      await bookingAPI.create({
        itemType: "Tourism",
        itemId: selectedSpot._id,
        bookingDate: bookingData.date,
        bookingTime: "10:00 AM",
        totalQuantity: bookingData.visitors,
        totalPrice,
      });

      toast.success("Visit booked successfully!");
      setTimeout(() => {
        setSelectedSpot(null);
        setBookingSuccess("");
        navigate("/my-bookings");
      }, 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Booking failed");
    } finally {
      setBookingLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!selectedSpot) return 0;
    return selectedSpot.entryFee * bookingData.visitors;
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Explore Tourist Spots
        </h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">
          Discover amazing places to visit in the city
        </p>
      </div>

      <div className="max-w-xl mx-auto mb-6 sm:mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search tourist spots by name or location..."
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
        {filteredSpots.length > 0 ? (
          filteredSpots.map((spot) => (
            <div
              key={spot._id}
              onClick={() => navigate(`/tourism/${spot._id}`)}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
            >
              <div className="h-40 sm:h-44 md:h-48 bg-gray-200 relative overflow-hidden">
                {spot.images && spot.images.length > 0 ? (
                  <img
                    src={spot.images[0]}
                    alt={spot.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105  cursor-pointer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <FiMapPin className="h-12 w-12 sm:h-16 sm:w-16" />
                  </div>
                )}
                <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold shadow">
                  ${spot.entryFee}
                  <span className="text-[10px] sm:text-xs ml-1 text-gray-200">
                    /person
                  </span>
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {spot.name}
                </h3>
                <div className="flex items-center text-gray-600 mb-2">
                  <FiMapPin className="h-4 w-4 mr-1" />
                  {spot.location}
                </div>
                <div className="flex items-center text-gray-600 mb-2">
                  <FiClock className="h-4 w-4 mr-1" />
                  {spot.openTime} - {spot.closeTime}
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {spot.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {spot.totalVisitors} visitors/day
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBookNow(spot);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 text-lg">No tourist spots found</p>
          </div>
        )}
      </div>

      {selectedSpot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Book Visit to {selectedSpot.name}
              </h3>
              <button
                onClick={() => setSelectedSpot(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>

            {bookingSuccess && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                {bookingSuccess}
              </div>
            )}

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Visit Date
                </label>
                <input
                  type="date"
                  value={bookingData.date}
                  onChange={(e) =>
                    setBookingData({ ...bookingData, date: e.target.value })
                  }
                  required
                  min={getTodayDate()}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Visitors
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedSpot.totalVisitors}
                  value={bookingData.visitors}
                  onChange={(e) =>
                    setBookingData({
                      ...bookingData,
                      visitors: parseInt(e.target.value),
                    })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="bg-gray-100 p-3 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Entry fee per person:</span>
                  <span className="font-medium">${selectedSpot.entryFee}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-bold text-lg">${calculateTotal()}</span>
                </div>
              </div>
              <button
                type="submit"
                disabled={bookingLoading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-medium"
              >
                {bookingLoading ? "Processing..." : "Confirm Booking"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tourism;
