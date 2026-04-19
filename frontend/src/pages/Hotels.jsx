import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { hotelAPI, bookingAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { FiSearch, FiMapPin, FiHome, FiX } from "react-icons/fi";
import { LocalizationProvider, DatePicker, TimePicker, } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const Hotels = () => {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [bookingType, setBookingType] = useState("night");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedHours, setSelectedHours] = useState(3);
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkInTime, setCheckInTime] = useState(null);
  const [nightCheckInTime, setNightCheckInTime] = useState(null);
  const [bookingData, setBookingData] = useState({
    checkIn: "",
    checkOut: "",
    rooms: 1,
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState("");
  const [displayCount, setDisplayCount] = useState(9);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchHotels();
  }, []);

  useEffect(() => {
    if (bookingType === "hour" && checkInDate && checkInTime) {
      const checkInFull = new Date(checkInDate);
      checkInFull.setHours(checkInTime.getHours(), checkInTime.getMinutes());
      const checkOutFull = new Date(
        checkInFull.getTime() + selectedHours * 60 * 60 * 1000,
      );

      setBookingData((prev) => ({
        ...prev,
        checkIn: checkInFull.toISOString(),
        checkOut: checkOutFull.toISOString(),
      }));
    }
  }, [bookingType, selectedHours, checkInDate, checkInTime]);

  useEffect(() => {
    if (bookingType === "night") {
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);

      const formatDate = (date) => date.toLocaleDateString("en-CA");
      setBookingData((prev) => ({
        ...prev,
        checkIn: formatDate(today),
        checkOut: formatDate(tomorrow),
      }));

      setNightCheckInTime(new Date());
    }
  }, [bookingType]);

  useEffect(() => {
    if (bookingType === "hour") {
      const now = new Date();
      setCheckInDate(now);
      setCheckInTime(now);
    }
  }, [bookingType]);

  const fetchHotels = async () => {
    try {
      const response = await hotelAPI.getAll();
      setHotels(response.data.hotels || []);
    } catch (err) {
      setError("Failed to load hotels");
    } finally {
      setLoading(false);
    }
  };

  const filteredHotels = hotels.filter(
    (hotel) =>
      hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.location.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleBookNow = (hotel) => {
    if (!isAuthenticated) {
      toast.error("Please login to book a hotel");
      return;
    }
    setSelectedHotel(hotel);

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    setBookingData({
      checkIn: formatDate(today),
      checkOut: formatDate(tomorrow),
      rooms: 1,
    });

    setShowBookingModal(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    setBookingSuccess("");

    if (bookingType === "hour" && (!checkInDate || !checkInTime)) {
      toast.error("Please select date & time");
      setBookingLoading(false);
      return;
    }

    try {
      let totalPrice = 0;
      let bookingFromDate = bookingData.checkIn;
      let bookingToDate = bookingData.checkOut;

      if (bookingType === "night") {
        const fromDate = new Date(bookingData.checkIn);
        if (nightCheckInTime) {
          fromDate.setHours(
            nightCheckInTime.getHours(),
            nightCheckInTime.getMinutes(),
          );
        }

        const toDate = new Date(bookingData.checkOut);
        if (nightCheckInTime) {
          toDate.setHours(
            nightCheckInTime.getHours(),
            nightCheckInTime.getMinutes(),
          );
        }

        const days = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24));

        totalPrice = selectedHotel.pricePerNight * days * bookingData.rooms;
        bookingFromDate = fromDate.toISOString();
        bookingToDate = toDate.toISOString();
      } else {
        const checkIn = new Date(bookingData.checkIn);
        const checkOut = new Date(
          checkIn.getTime() + selectedHours * 60 * 60 * 1000,
        );

        bookingToDate = checkOut.toISOString();

        const pricePerHour =
          selectedHotel.pricePerHour || selectedHotel.pricePerNight / 24;

        let basePrice = pricePerHour * selectedHours;
        let discount = 0;

        if (selectedHours === 6) {
          discount = 0.1; // 10%
        } else if (selectedHours === 9) {
          discount = 0.2; // 20%
        }
        const discountedPrice = basePrice - basePrice * discount;

        totalPrice = discountedPrice * bookingData.rooms;
      }

      await bookingAPI.create({
        itemType: "Hotel",
        itemId: selectedHotel._id,
        bookingType,
        hours: bookingType === "hour" ? selectedHours : null,
        bookingFromDate,
        bookingToDate,
        totalQuantity: bookingData.rooms,
        totalPrice,
      });

      toast.success("Hotel booked successfully!");

      setTimeout(() => {
        setSelectedHotel(null);
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
    if (!selectedHotel || !bookingData.checkIn) return 0;

    if (bookingType === "night") {
      if (!bookingData.checkOut) return 0;
      const days =
        (new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) /
        (1000 * 60 * 60 * 24);
      return Math.ceil(days) * selectedHotel.pricePerNight * bookingData.rooms;
    } else {
      const pricePerHour =
        selectedHotel.pricePerHour || selectedHotel.pricePerNight / 24;

      let basePrice = pricePerHour * selectedHours;
      let discount = 0;
      if (selectedHours === 6) {
        discount = 0.1;
      } else if (selectedHours === 9) {
        discount = 0.2;
      }
      const discountedPrice = basePrice - basePrice * discount;
      return Math.ceil(discountedPrice * bookingData.rooms);
    }
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
          Find Your Perfect Hotel
        </h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">
          Discover comfortable stays across the city
        </p>
      </div>

      <div className="max-w-xl mx-auto mb-6 sm:mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search hotels by name or location..."
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
        {filteredHotels.length > 0 ? (
          filteredHotels.slice(0, displayCount).map((hotel) => (
            <div
              key={hotel._id}
              onClick={() => navigate(`/hotels/${hotel._id}`)}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
            >
              <div className="h-40 sm:h-44 md:h-48 bg-gray-200 relative overflow-hidden">
                {hotel.images && hotel.images.length > 0 ? (
                  <img
                    src={hotel.images[0]}
                    alt={hotel.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105  cursor-pointer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <FiHome className="h-12 w-12 sm:h-16 sm:w-16" />
                  </div>
                )}
                <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold shadow">
                  ₹{hotel.pricePerNight}
                  <span className="text-[10px] sm:text-xs ml-1 text-gray-200">
                    /night
                  </span>
                </div>
              </div>

              <div className="p-3 sm:p-4">
                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 mb-1 line-clamp-1">
                  {hotel.name}
                </h3>
                <div className="flex items-center text-gray-600 mb-1 sm:mb-2 text-xs sm:text-sm">
                  <FiMapPin className="h-4 w-4 mr-1" />
                  {hotel.location}
                </div>
                <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
                  {hotel.description}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs sm:text-sm text-gray-700 bg-gray-100 border px-3 py-1 rounded-full whitespace-nowrap">
                    {hotel.totalRooms} Rooms
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBookNow(hotel);
                    }}
                    className="bg-blue-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg hover:bg-blue-700 transition  cursor-pointer whitespace-nowrap"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <p className="text-gray-500 text-lg">No hotels found</p>
          </div>
        )}
      </div>

      {filteredHotels.length > displayCount && (
        <div className="text-center mt-6 sm:mt-8 px-2">
          <button
            onClick={() => setDisplayCount((prev) => prev + 9)}
            className="bg-gray-600/70 text-white px-5 sm:px-8 py-2.5 sm:py-3 rounded-3xl hover:bg-blue-700 transition font-semibold text-sm sm:text-base cursor-pointer"
          >
            Load More Hotels ( {filteredHotels.length - displayCount} left )
          </button>
        </div>
      )}

      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                Book {selectedHotel.name}
              </h3>
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  setBookingData({ checkIn: "", checkOut: "", rooms: 1 });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>

            {bookingSuccess && (
              <div className="mb-4 p-3 text-sm bg-green-100 border border-green-400 text-green-700 rounded">
                {bookingSuccess}
              </div>
            )}

            {/* Booking Type Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
              <button
                type="button"
                onClick={() => setBookingType("night")}
                className={`flex-1 py-2 rounded-lg ${
                  bookingType === "night"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600"
                }`}
              >
                Nightly
              </button>

              <button
                type="button"
                onClick={() => setBookingType("hour")}
                className={`flex-1 py-2 rounded-lg ${
                  bookingType === "hour"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600"
                }`}
              >
                Hourly
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              {bookingType === "night" ? (
                <>
                  {/* Night Booking */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check-in Date
                    </label>
                    <input
                      type="date"
                      value={bookingData.checkIn?.split("T")[0] || ""}
                      onChange={(e) =>
                        setBookingData({
                          ...bookingData,
                          checkIn: e.target.value,
                        })
                      }
                      min={getTodayDate()}
                      required
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg  focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check-out Date
                    </label>
                    <input
                      type="date"
                      value={bookingData.checkOut?.split("T")[0] || ""}
                      onChange={(e) =>
                        setBookingData({
                          ...bookingData,
                          checkOut: e.target.value,
                        })
                      }
                      min={
                        bookingData.checkIn
                          ? new Date(
                              new Date(bookingData.checkIn).setDate(
                                new Date(bookingData.checkIn).getDate() + 1,
                              ),
                            ).toLocaleDateString("en-CA")
                          : new Date(
                              new Date().setDate(new Date().getDate() + 1),
                            ).toLocaleDateString("en-CA")
                      }
                      required
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg  focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <TimePicker
                        label="Check-in Time"
                        value={nightCheckInTime}
                        onChange={(newValue) => setNightCheckInTime(newValue)}
                        renderInput={(params) => (
                          <input
                            {...params.inputProps}
                            className="w-full border p-2 rounded"
                          />
                        )}
                      />
                    </LocalizationProvider>
                  </div>
                </>
              ) : (
                <>
                  {/* Hourly Booking */}
                  <div className="flex gap-2">
                    {[3, 6, 9].map((hrs) => (
                      <button
                        key={hrs}
                        type="button"
                        onClick={() => setSelectedHours(hrs)}
                        className={`flex-1 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg border border-gray-300 ${
                          selectedHours === hrs
                            ? "bg-blue-600 text-white"
                            : "bg-white text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {hrs} Hours
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">
                      Check-in Date & Time
                    </label>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <div className="grid grid-cols-2 gap-2">
                        <DatePicker
                          label="Date"
                          value={checkInDate}
                          onChange={setCheckInDate}
                          format="dd/MM/yyyy"
                          minDate={new Date()}
                          slotProps={{
                            textField: {
                              className: "w-full",
                            },
                          }}
                        />
                        <TimePicker
                          label="Time"
                          value={checkInTime}
                          onChange={setCheckInTime}
                          slotProps={{
                            textField: {
                              className: "w-full",
                            },
                          }}
                        />
                      </div>
                    </LocalizationProvider>
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Rooms
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedHotel.totalRooms}
                  value={bookingData.rooms}
                  onChange={(e) =>
                    setBookingData({
                      ...bookingData,
                      rooms: parseInt(e.target.value),
                    })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="bg-gray-50 border border-gray-300 rounded-xl p-3 sm:p-4 space-y-2 text-sm sm:text-base">
                {bookingType === "night" && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Price per night:</span>
                    <span className="font-medium text-gray-800">
                      ₹{selectedHotel.pricePerNight}
                    </span>
                  </div>
                )}

                {bookingType === "hour" && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Hourly price:</span>
                    <span className="font-medium text-gray-800">
                      ₹
                      {(
                        selectedHotel.pricePerHour ||
                        selectedHotel.pricePerNight / 24
                      ).toFixed(0)}
                      /hr
                    </span>
                  </div>
                )}

                <div className="border-t pt-2 flex justify-between items-center text-sm mt-2">
                  <span className="text-gray-700 font-medium">Total:</span>

                  {bookingType === "hour" &&
                  (selectedHours === 6 || selectedHours === 9) ? (
                    <div className="text-right">
                      {/* Original price */}
                      <div className="text-sm text-gray-400 line-through">
                        ₹
                        {Math.ceil(
                          (selectedHotel.pricePerHour ||
                            selectedHotel.pricePerNight / 24) *
                            selectedHours *
                            bookingData.rooms,
                        )}
                      </div>

                      {/* Discounted price */}
                      <div className="text-lg font-bold text-gray-600">
                        ₹{calculateTotal()}
                      </div>
                    </div>
                  ) : (
                    <span className="text-lg font-bold text-gray-800">
                      ₹{calculateTotal()}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="submit"
                disabled={bookingLoading}
                className="w-full bg-blue-600 text-white py-2.5 sm:py-3 text-sm sm:text-base rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-medium"
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

export default Hotels;
