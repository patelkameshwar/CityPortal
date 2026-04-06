import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";
import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { hotelAPI, bookingAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  FiMapPin,
  FiHome,
  FiUser,
  FiArrowLeft,
  FiX,
  FiArrowRight,
  FiClock,
  FiAlertCircle,
  FiNavigation,
  FiChevronLeft,
  FiChevronRight,
  FiCoffee,
  FiZap,
} from "react-icons/fi";
import { MdOutlineBed } from "react-icons/md";
import {
  LocalizationProvider,
  DatePicker,
  TimePicker,
} from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const HotelDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingData, setBookingData] = useState({
    checkIn: "",
    checkOut: "",
    rooms: 1,
  });
  const [bookingType, setBookingType] = useState("night");
  const [selectedHours, setSelectedHours] = useState(3);
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkInTime, setCheckInTime] = useState(null);
  const [nightCheckInTime, setNightCheckInTime] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [activeTab, setActiveTab] = useState("amenities");
  const [similarHotels, setSimilarHotels] = useState([]);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [similarLoading, setSimilarLoading] = useState(false);
  const [similarError, setSimilarError] = useState("");
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [mapCenter, setMapCenter] = useState(null);
  const { isAuthenticated } = useAuth();
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const isMobile = window.innerWidth < 640;

  useEffect(() => {
    if (bookingType === "hour" && checkInDate && checkInTime) {
      const checkInFull = new Date(checkInDate);
      checkInFull.setHours(checkInTime.getHours(), checkInTime.getMinutes());
      const checkOutFull = new Date(
        checkInFull.getTime() + selectedHours * 60 * 60 * 1000,
      );
      setBookingData((prev) => ({
        ...prev,
        checkIn: checkInFull,
        checkOut: checkOutFull,
      }));
    }
  }, [bookingType, selectedHours, checkInDate, checkInTime]);

  useEffect(() => {
    if (bookingType === "night") {
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);
      const now = new Date();
      const checkInFull = new Date(today);
      checkInFull.setHours(now.getHours(), now.getMinutes());
      const checkOutFull = new Date(tomorrow);
      checkOutFull.setHours(now.getHours(), now.getMinutes());
      setBookingData((prev) => ({
        ...prev,
        checkIn: checkInFull,
        checkOut: checkOutFull,
      }));
      setNightCheckInTime(now);
    }
  }, [bookingType]);

  useEffect(() => {
    fetchHotel();
  }, [id]);

  useEffect(() => {
    if (activeTab === "similar" && hotel) {
      fetchSimilarHotels();
    }
  }, [activeTab, hotel]);

  useEffect(() => {
    if (hotel?.coordinates?.lat && hotel?.coordinates?.lng) {
      setMapCenter({
        lat: hotel.coordinates.lat,
        lng: hotel.coordinates.lng,
      });
    } else if (hotel?.location) {
      let lat = 21.7679;
      let lng = 72.1359;
      const hash = hotel.location
        .split("")
        .reduce((a, b) => a + b.charCodeAt(0), 0);
      lat += (hash % 100) / 10000;
      lng += ((hash * 31) % 100) / 10000;
      setMapCenter({ lat, lng });
    }
  }, [hotel]);

  useEffect(() => {
    if (bookingType === "hour") {
      const now = new Date();
      setCheckInDate(now);
      setCheckInTime(now);
    }
  }, [bookingType]);

  const fetchHotel = async () => {
    try {
      const response = await hotelAPI.getById(id);
      setHotel(response.data.hotel);
    } catch (err) {
      setError("Failed to load hotel details");
    } finally {
      setLoading(false);
    }
  };

  const fetchSimilarHotels = async () => {
    if (!hotel) return;
    setSimilarLoading(true);
    setSimilarError("");
    try {
      const response = await hotelAPI.getSimilar(hotel._id);
      setSimilarHotels(response.data.similarHotels || []);
    } catch (err) {
      setSimilarError("Failed to load similar hotels");
    } finally {
      setSimilarLoading(false);
    }
  };

  const handleBookNow = () => {
    if (!isAuthenticated) {
      toast.error("Please login to book a hotel");
      navigate("/login");
      return;
    }
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const now = new Date();
    const checkInFull = new Date(today);
    checkInFull.setHours(now.getHours(), now.getMinutes());
    const checkOutFull = new Date(tomorrow);
    checkOutFull.setHours(now.getHours(), now.getMinutes());
    setBookingData({
      checkIn: checkInFull,
      checkOut: checkOutFull,
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
      return;
    }
    try {
      let totalPrice = 0;
      let bookingFromDate = new Date(bookingData.checkIn).toISOString();
      let bookingToDate = new Date(bookingData.checkOut).toISOString();
      if (bookingType === "night") {
        const fromDate = new Date(bookingData.checkIn);
        const toDate = new Date(bookingData.checkOut);
        const days = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24));
        totalPrice = hotel.pricePerNight * days * bookingData.rooms;
      } else {
        const checkInDate = new Date(bookingData.checkIn);
        const checkOut = new Date(
          checkInDate.getTime() + selectedHours * 60 * 60 * 1000,
        );
        bookingToDate = checkOut.toISOString();
        const pricePerHour = hotel.pricePerNight / 24;
        totalPrice = pricePerHour * selectedHours * bookingData.rooms;
      }
      await bookingAPI.create({
        itemType: "Hotel",
        itemId: hotel._id,
        bookingType,
        hours: bookingType === "hour" ? selectedHours : null,
        bookingFromDate,
        bookingToDate,
        totalQuantity: bookingData.rooms,
      });

      toast.success("Hotel booked successfully!");
      setTimeout(() => {
        setBookingSuccess("");
        setShowBookingModal(false);
        navigate("/my-bookings");
      }, 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Booking failed");
    } finally {
      setBookingLoading(false);
    }
    console.log({
      bookingType,
      selectedHours,
      bookingData,
    });
  };

  const calculateTotal = () => {
    if (!hotel || !bookingData.checkIn) return 0;
    if (bookingType === "night") {
      if (!bookingData.checkOut) return 0;
      const days =
        (new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) /
        (1000 * 60 * 60 * 24);
      return Math.ceil(days) * hotel.pricePerNight * bookingData.rooms;
    } else {
      const pricePerHour = hotel.pricePerHour || hotel.pricePerNight / 24;
      let basePrice = pricePerHour * selectedHours * bookingData.rooms;
      let discount = 0;
      if (selectedHours === 6) discount = 0.1;
      if (selectedHours === 9) discount = 0.2;
      const finalPrice = basePrice - basePrice * discount;
      return Math.ceil(finalPrice);
    }
  };

  const openDirections = () => {
    if (!mapCenter) return;
    const { lat, lng } = mapCenter;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, "_blank");
  };

  const nextImage = () => {
    if (hotel && hotel.images) {
      setCurrentImageIndex((prev) => (prev + 1) % hotel.images.length);
    }
  };

  const prevImage = () => {
    if (hotel && hotel.images) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + hotel.images.length) % hotel.images.length,
      );
    }
  };

  const openPhotoModal = () => {
    setCurrentImageIndex(0);
    setShowPhotoModal(true);
  };

  const closePhotoModal = () => {
    setShowPhotoModal(false);
  };

  const mapContainerStyle = {
    width: "100%",
    height: "100%",
  };

  const hasMoreAmenities = !!(
    (hotel?.basicFacilities?.length || 0) > 4 ||
    (hotel?.roomAmenities?.length || 0) > 4 ||
    (hotel?.healthWellness?.length || 0) > 4 ||
    (hotel?.safetySecurity?.length || 0) > 4
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Hotel not found
        </h2>
        <button
          onClick={() => navigate("/hotels")}
          className="text-blue-600 hover:underline"
        >
          Back to Hotels
        </button>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <button
          onClick={() => navigate("/hotels")}
          className="hidden sm:flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
        >
          <FiArrowLeft className="h-5 w-5" />
          Back to Hotels
        </button>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          {hotel.name}
        </h1>
        <div className="bg-white rounded-lg shadow-lg overflow-hidden pb-20 sm:pb-0">
          <div className="flex flex-col lg:flex-row gap-4 p-3 sm:p-4">
            {/* Left Div - Image */}
            <div className="left-div w-full lg:w-2/3 rounded-xl">
              <div className="h-52 sm:h-64 md:h-80 lg:h-105 bg-gray-200 relative rounded-xl overflow-hidden">
                {hotel.images && hotel.images.length > 0 ? (
                  <img
                    src={hotel.images[0]}
                    alt={hotel.name}
                    className="w-full h-full object-cover rounded-xl transition duration-300 hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <FiHome className="h-24 w-24" />
                  </div>
                )}

                {hotel.images && hotel.images.length > 0 && (
                  <button
                    onClick={openPhotoModal}
                    className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 bg-gray-800/70 border border-white text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2 hover:bg-gray-800 transition cursor-pointer"
                  >
                    <span>{hotel.images.length}</span>
                    <span>Property Photos</span>
                    <FiArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Right Div - Info */}
            <div className="right-div w-full lg:w-1/3 p-3 sm:p-5 md:p-6 bg-gray-100 border border-gray-300 flex flex-col rounded-xl">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                    Deluxe Room
                  </h2>
                </div>
                <span className="bg-blue-50 text-blue-700 text-[10px] uppercase font-bold px-2 py-1 rounded-md tracking-wider">
                  Recommended
                </span>
              </div>
              <div className="space-y-2.5 mb-6">
                <div className="flex items-center gap-3 p-2.5 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                  <FiCoffee className="h-4 w-4 text-emerald-600" />
                  <span className="text-emerald-800 text-xs sm:text-sm font-semibold">
                    Free Breakfast Upgrade
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-1 pl-1">
                  <div className="flex items-center gap-2 text-teal-700 text-xs sm:text-sm font-medium">
                    <FiZap className="h-4 w-4 text-gray-700" />
                    Enjoy Happy Hours with 1+1 offer
                  </div>
                  <div className="flex items-center gap-2 text-teal-700 text-xs sm:text-sm font-medium">
                    <FiClock className="h-4 w-4 text-gray-700" />
                    Early check-in upto 2 hrs
                  </div>
                  <div className="flex items-center gap-2 text-red-500 text-xs sm:text-sm font-medium">
                    <FiAlertCircle className="h-4 w-4" />
                    Non-Refundable
                  </div>
                </div>
              </div>

              {/* Pricing & Capacity Section */}
              <div className="border-t border-gray-100 pt-3 mb-4">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                  {/* Left: Capacity Details */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wider font-bold">
                      Room Capacity
                    </div>
                    <div className="flex items-center gap-3 text-gray-700 font-semibold bg-gray-50 px-3 py-1.5 rounded-lg w-fit">
                      <div className="flex items-center gap-1.5">
                        <FiUser className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">2 Guests</span>
                      </div>
                      <div className="w-px h-3 bg-gray-300" />
                      <div className="flex items-center gap-1.5">
                        <MdOutlineBed className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">1 Room</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Pricing Details */}
                  <div className="flex flex-col sm:items-end">
                    <div className="flex items-baseline gap-1">
                      <span className="text-gray-900 text-xl font-black tracking-tight">
                        ₹{hotel.pricePerNight}
                      </span>
                      <span className="text-gray-500 text-sm font-medium">
                        / night
                      </span>
                    </div>

                    {/* Hourly Tag - Highlighted slightly */}
                    <div className="mt-1.5 flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md border border-emerald-100">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[11px] font-bold uppercase tracking-wide">
                        Hourly: ₹
                        {(
                          hotel.pricePerHour || hotel.pricePerNight / 24
                        ).toFixed(0)}
                        /hr
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleBookNow}
                className="w-full bg-blue-600 text-white py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-medium hover:bg-blue-700 transition cursor-pointer text-sm sm:text-base"
              >
                Reserve Now
              </button>
              <p className="text-center text-[11px] text-gray-400 mt-3 font-medium">
                No hidden fees • Instant Confirmation
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-6 md:p-8">
            {/* About Properties Section */}
            <div className="mb-6">
              <h2 className="text-base sm:text-xl font-bold text-gray-800 mb-2">
                About Property
              </h2>
              {isDescriptionExpanded ? (
                <>
                  <p className="text-gray-600 leading-relaxed wrap-break-word text-sm sm:text-base">
                    {hotel.description}
                  </p>
                  <button
                    onClick={() => setIsDescriptionExpanded(false)}
                    className="mt-2 text-blue-600 hover:underline font-medium text-sm cursor-pointer"
                  >
                    Read less
                  </button>
                </>
              ) : (
                <div className="text-gray-600 transition-all duration-300 leading-relaxed wrap-break-word text-sm sm:text-base">
                  {hotel.description ? hotel.description.slice(0, 320) : ""}

                  {hotel.description?.length > 320 && (
                    <>
                      ...
                      <button
                        onClick={() => setIsDescriptionExpanded(true)}
                        className="ml-1 text-blue-600 hover:underline font-medium text-sm cursor-pointer"
                      >
                        Read more
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Location and Rooms */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-gray-600 mb-6">
              {/* Location */}
              <div className="flex items-start sm:items-center gap-2 min-w-0">
                <FiMapPin className="h-5 w-5 text-blue-500 shrink-0" />
                <span className="text-sm sm:text-base wrap-break-word line-clamp-1 sm:line-clamp-none">
                  {hotel.location}
                </span>
              </div>

              {/* Rooms */}
              <div className="flex items-center gap-2">
                <FiHome className="h-5 w-5 text-blue-500 shrink-0" />
                <span className="text-sm sm:text-base whitespace-nowrap">
                  {hotel.totalRooms} Rooms Available
                </span>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex overflow-x-auto border-b border-gray-200 mb-6 scrollbar-hide gap-2 px-1">
              <button
                onClick={() => setActiveTab("amenities")}
                className={`px-4 py-2 font-medium text-sm whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === "amenities"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Amenities
              </button>

              <button
                onClick={() => setActiveTab("policies")}
                className={`px-4 py-2 font-medium text-sm whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === "policies"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Property Policies
              </button>
              <button
                onClick={() => setActiveTab("location")}
                className={`px-4 py-2 font-medium text-sm whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === "location"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Location
              </button>
              <button
                onClick={() => setActiveTab("similar")}
                className={`px-4 py-2 font-medium text-sm whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === "similar"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Similar Properties
              </button>
            </div>

            {/* Tab Content */}
            <div className="min-h-64">
              {activeTab === "amenities" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-base sm:text-xl font-bold text-gray-800 mb-4">
                      Popular Amenities
                    </h2>
                    {hotel.amenities && hotel.amenities.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {hotel.amenities.map((amenity, index) => (
                          <span
                            key={`main-${index}`}
                            className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-indigo-600 italic text-sm mb-6">
                        No amenities available
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <div className=" p-4 rounded-xl">
                      <h3 className="text-md font-bold text-gray-800 mb-3 flex items-center">
                        🏠 Basic Facilities
                      </h3>
                      {hotel.basicFacilities &&
                      hotel.basicFacilities.length > 0 ? (
                        <div className="space-y-2">
                          {hotel.basicFacilities
                            .slice(
                              0,
                              showAllAmenities
                                ? hotel.basicFacilities.length
                                : 4,
                            )
                            .map((item, index) => (
                              <div
                                key={`basic-${index}`}
                                className="flex items-center p-2 bg-gray-100 rounded-2xl shadow-sm"
                              >
                                <div className="w-2 h-2 bg-gray-600 rounded-full mr-3 shrink-0"></div>
                                <span className="text-sm bg-gray-100 text-gray-600">
                                  {item}
                                </span>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p className="text-indigo-600 italic text-sm">
                          No basic facilities listed
                        </p>
                      )}
                    </div>

                    <div className="p-4 rounded-xl">
                      <h3 className="text-md font-bold text-gray-800 mb-3 flex items-center">
                        🛏️ Room Amenities
                      </h3>
                      {hotel.roomAmenities && hotel.roomAmenities.length > 0 ? (
                        <div className="space-y-2">
                          {hotel.roomAmenities
                            .slice(
                              0,
                              showAllAmenities ? hotel.roomAmenities.length : 4,
                            )
                            .map((item, index) => (
                              <div
                                key={`room-${index}`}
                                className="flex items-center p-2 bg-gray-100 rounded-2xl shadow-sm"
                              >
                                <div className="w-2 h-2 bg-gray-600 rounded-full mr-3 shrink-0"></div>
                                <span className="text-sm bg-gray-100 text-gray-600">
                                  {item}
                                </span>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p className="text-indigo-600 italic text-sm">
                          No room amenities listed
                        </p>
                      )}
                    </div>

                    <div className=" p-4 rounded-xl">
                      <h3 className="text-md font-bold text-gray-800 mb-3 flex items-center">
                        💪 Health & Wellness
                      </h3>
                      {hotel.healthWellness &&
                      hotel.healthWellness.length > 0 ? (
                        <div className="space-y-2">
                          {hotel.healthWellness
                            .slice(
                              0,
                              showAllAmenities
                                ? hotel.healthWellness.length
                                : 4,
                            )
                            .map((item, index) => (
                              <div
                                key={`health-${index}`}
                                className="flex items-center p-2 bg-gray-100 rounded-2xl shadow-sm"
                              >
                                <div className="w-2 h-2 bg-gray-600 rounded-full mr-3 shrink-0"></div>
                                <span className="text-sm bg-gray-100 text-gray-600">
                                  {item}
                                </span>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p className="text-indigo-600 italic text-sm">
                          No health & wellness features listed
                        </p>
                      )}
                    </div>

                    <div className=" p-4 rounded-xl">
                      <h3 className="text-xs font-bold text-gray-800 mb-3 flex items-center">
                        🛡️ Safety & Security
                      </h3>
                      {hotel.safetySecurity &&
                      hotel.safetySecurity.length > 0 ? (
                        <div className="space-y-2">
                          {hotel.safetySecurity
                            .slice(
                              0,
                              showAllAmenities
                                ? hotel.safetySecurity.length
                                : 4,
                            )
                            .map((item, index) => (
                              <div
                                key={`safety-${index}`}
                                className="flex items-center p-2 bg-gray-100 rounded-2xl shadow-sm"
                              >
                                <div className="w-2 h-2 bg-gray-600 rounded-full mr-3 shrink-0"></div>
                                <span className="text-sm bg-gray-100 text-gray-600">
                                  {item}
                                </span>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p className="text-indigo-600 italic text-sm">
                          No safety features listed
                        </p>
                      )}
                    </div>
                  </div>
                  {hasMoreAmenities && (
                    <button
                      onClick={() => setShowAllAmenities(!showAllAmenities)}
                      className="bg-gray-500 text-white py-2 px-8 rounded-2xl hover:bg-blue-700 transition font-medium text-sm -mt-4 cursor-pointer block mx-auto"
                    >
                      {showAllAmenities ? "Show Less" : "Show More"}
                    </button>
                  )}
                </div>
              )}

              {activeTab === "policies" && (
                <div>
                  <h2 className="text-base sm:text-xl font-bold text-gray-800 mb-4">
                    Property Policies
                  </h2>
                  {hotel.policies && hotel.policies.length > 0 ? (
                    <ul className="list-[circle] pl-5 space-y-2">
                      {hotel.policies.map((policy, index) => (
                        <li
                          key={index}
                          className="text-gray-700 text-sm leading-relaxed"
                        >
                          {policy}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-600 italic">No policies listed</p>
                  )}
                </div>
              )}

              {activeTab === "location" && (
                <div>
                  <h2 className="text-base sm:text-xl font-bold text-gray-800 mb-4">
                    Location
                  </h2>
                  <div className="flex items-start gap-2 mb-2">
                    <FiMapPin className="h-5 w-5 text-gray-600 mt-0.5" />
                    <div>
                      <p className="text-gray-800">{hotel.location}</p>
                    </div>
                  </div>
                  {mapCenter ? (
                    !isLoaded ? (
                      <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
                        <p className="text-gray-600">Loading map...</p>
                      </div>
                    ) : (
                      <div className="relative h-[250px] sm:h-[350px] md:h-[400px]">
                        <GoogleMap
                          mapContainerStyle={mapContainerStyle}
                          center={mapCenter}
                          zoom={14}
                          options={{
                            streetViewControl: !isMobile,
                            mapTypeControl: !isMobile,
                            fullscreenControl: true, // Fullscreen
                            zoomControl: !isMobile, // Keep zoom (good UX)

                            clickableIcons: false,

                            styles: [
                              {
                                featureType: "poi",
                                elementType: "labels",
                                stylers: [{ visibility: "off" }],
                              },
                            ],
                          }}
                        >
                          <Marker position={mapCenter} />
                        </GoogleMap>

                        <button
                          onClick={openDirections}
                          title="Get Directions"
                          className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 bg-white/90 backdrop-blur-md text-blue-600 p-2.5 sm:p-3 rounded-full shadow-lg hover:bg-blue-500 hover:text-white transition cursor-pointer z-10"
                        >
                          <FiNavigation className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    )
                  ) : (
                    <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
                      <p className="text-gray-600">Loading map...</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "similar" && (
                <div>
                  <h2 className="text-base sm:text-xl font-bold text-gray-800 mb-4">
                    Similar Properties
                  </h2>
                  {similarLoading ? (
                    <div className="flex justify-center items-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : similarError ? (
                    <p className="text-red-600">{similarError}</p>
                  ) : similarHotels.length > 0 ? (
                    <div className="flex sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-x-auto sm:overflow-visible pb-2">
                      {similarHotels.map((hotel) => (
                        <div
                          key={hotel._id}
                          onClick={() => navigate(`/hotels/${hotel._id}`)}
                          className="min-w-[220px] sm:min-w-0 w-full bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer"
                        >
                          {/* Image */}
                          <div className="h-40 bg-gray-200 relative">
                            {hotel.images && hotel.images.length > 0 ? (
                              <img
                                src={hotel.images[0]}
                                alt={hotel.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <FiHome className="h-10 w-10" />
                              </div>
                            )}
                            <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium shadow">
                              ₹{hotel.pricePerNight}
                              <span className="text-[10px] sm:text-xs ml-1 text-gray-200">
                                /night
                              </span>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-3">
                            <h3 className="font-semibold text-gray-800 text-sm line-clamp-1">
                              {hotel.name}
                            </h3>

                            <div className="flex gap-1 text-gray-600 text-xs sm:text-sm mt-1 min-w-0">
                              <FiMapPin className="h-3.5 w-3.5 shrink-0 mt-[2px]" />
                              <span className="break-words line-clamp-1">
                                {hotel.location}
                              </span>
                            </div>
                            <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 mt-1">
                              {hotel.description}
                            </p>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/hotels/${hotel._id}`);
                              }}
                              className="mt-2 w-full bg-blue-600 text-white py-1.5 rounded-lg hover:bg-blue-700 transition text-xs font-medium"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">
                      No similar properties available
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {showBookingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                  Book {hotel.name}
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
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
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
                        value={
                          bookingData.checkIn
                            ? new Date(bookingData.checkIn).toLocaleDateString(
                                "en-CA",
                              )
                            : ""
                        }
                        onChange={(e) => {
                          const date = new Date(e.target.value);
                          const time = nightCheckInTime || new Date();

                          date.setHours(time.getHours(), time.getMinutes());
                          setBookingData({
                            ...bookingData,
                            checkIn: date,
                          });
                        }}
                        min={getTodayDate()}
                        required
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Check-out Date
                      </label>
                      <input
                        type="date"
                        value={
                          bookingData.checkOut
                            ? new Date(bookingData.checkOut).toLocaleDateString(
                                "en-CA",
                              )
                            : ""
                        }
                        onChange={(e) => {
                          const date = new Date(e.target.value);
                          const time = nightCheckInTime || new Date();

                          date.setHours(time.getHours(), time.getMinutes());
                          setBookingData({
                            ...bookingData,
                            checkOut: date,
                          });
                        }}
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
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg"
                      />
                    </div>
                    <div>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <TimePicker
                          label="Check-in Time"
                          value={nightCheckInTime}
                          onChange={(newValue) => {
                            setNightCheckInTime(newValue);

                            if (!newValue) return;

                            setBookingData((prev) => {
                              const updatedCheckIn = new Date(prev.checkIn);
                              const updatedCheckOut = new Date(prev.checkOut);

                              // ✅ apply selected time
                              updatedCheckIn.setHours(
                                newValue.getHours(),
                                newValue.getMinutes(),
                              );

                              updatedCheckOut.setHours(
                                newValue.getHours(),
                                newValue.getMinutes(),
                              );

                              return {
                                ...prev,
                                checkIn: updatedCheckIn,
                                checkOut: updatedCheckOut,
                              };
                            });
                          }}
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
                          className={`flex-1 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg border ${
                            selectedHours === hrs
                              ? "bg-blue-600 text-white"
                              : "bg-white text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {hrs} hours
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
                    max={hotel.totalRooms}
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
                <div className="bg-gray-50 border rounded-xl p-3 sm:p-4 space-y-2 text-sm sm:text-base">
                  {bookingType === "night" && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Price per night:</span>
                      <span className="font-medium text-gray-800">
                        ₹{hotel.pricePerNight}
                      </span>
                    </div>
                  )}

                  {bookingType === "hour" && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Hourly price:</span>
                      <span className="font-medium text-gray-800">
                        ₹
                        {(
                          hotel.pricePerHour || hotel.pricePerNight / 24
                        ).toFixed(0)}
                        /hr
                      </span>
                    </div>
                  )}

                  <div className="border-t pt-2 flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Total:</span>

                    {bookingType === "hour" &&
                    (selectedHours === 6 || selectedHours === 9) ? (
                      <div className="text-right">
                        {/* Original price */}
                        <div className="text-sm text-gray-400 line-through">
                          ₹
                          {Math.ceil(
                            (hotel.pricePerHour || hotel.pricePerNight / 24) *
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

        {/* Photo Modal */}
        {showPhotoModal && hotel && hotel.images && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
            <div className="relative max-w-4xl w-full">
              <button
                onClick={closePhotoModal}
                className="absolute -top-12 right-0 text-white text-2xl hover:text-gray-300"
              >
                <FiX className="h-8 w-8" />
              </button>

              <div className="relative">
                <img
                  src={hotel.images[currentImageIndex]}
                  alt={`${hotel.name} - ${currentImageIndex + 1}`}
                  className="w-full max-h-[70vh] object-contain rounded-lg"
                />

                {hotel.images.length > 1 && (
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full"
                  >
                    <FiChevronLeft className="h-6 w-6" />
                  </button>
                )}

                {hotel.images.length > 1 && (
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full"
                  >
                    <FiChevronRight className="h-6 w-6" />
                  </button>
                )}
              </div>

              <div className="text-center text-white mt-4">
                {currentImageIndex + 1} / {hotel.images.length}
              </div>

              {hotel.images.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto justify-center ">
                  {hotel.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 ${
                        index === currentImageIndex
                          ? "border-blue-500"
                          : "border-transparent"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {/* Mobile Sticky Book Button */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t p-3 sm:hidden z-40">
        <button
          onClick={handleBookNow}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium"
        >
          Book Now
        </button>
      </div>
    </div>
  );
};

export default HotelDetails;
