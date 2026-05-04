import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";
import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { tourismAPI, bookingAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  FiMapPin,
  FiCalendar,
  FiNavigation,
  FiUser,
  FiArrowLeft,
  FiX,
  FiArrowRight,
  FiClock,
  FiAlertCircle,
  FiCircle,
  FiChevronLeft,
  FiChevronRight,
  FiCamera,
  FiGift,
} from "react-icons/fi";
import { MdEventSeat } from "react-icons/md";

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatTourismDate = (fromDate, toDate) => {
  if (!fromDate || !toDate) return "";
  const from = new Date(fromDate);
  const to = new Date(toDate);

  if (
    from.getFullYear() !== to.getFullYear() ||
    from.getMonth() !== to.getMonth() ||
    from.getDate() !== to.getDate()
  ) {
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
    return from.toLocaleDateString("en-GB", { day: "numeric", month: "long" });
  }
};

const TourismDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tourism, setTourism] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingData, setBookingData] = useState({
    bookingDate: "",
    totalQuantity: 1,
  });
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [activeTab, setActiveTab] = useState("amenities");
  const [similarTourism, setSimilarTourism] = useState([]);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [similarLoading, setSimilarLoading] = useState(false);
  const [similarError, setSimilarError] = useState("");
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [mapCenter, setMapCenter] = useState(null);
  const { isAuthenticated } = useAuth();
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchTourism();
  }, [id]);

  useEffect(() => {
    if (activeTab === "similar" && tourism) {
      fetchSimilarTourism();
    }
  }, [activeTab, tourism]);

  useEffect(() => {
    if (tourism?.coordinates?.lat && tourism?.coordinates?.lng) {
      setMapCenter({
        lat: tourism.coordinates.lat,
        lng: tourism.coordinates.lng,
      });
    } else if (tourism?.location) {
      let lat = 21.7679;
      let lng = 72.1359;
      const hash = tourism.location
        .split("")
        .reduce((a, b) => a + b.charCodeAt(0), 0);
      lat += (hash % 100) / 10000;
      lng += ((hash * 31) % 100) / 10000;
      setMapCenter({ lat, lng });
    }
  }, [tourism]);

  const fetchTourism = async () => {
    try {
      const response = await tourismAPI.getById(id);
      setTourism(response.data.tourism);
    } catch (err) {
      setError("Failed to load tourism details");
    } finally {
      setLoading(false);
    }
  };

  const fetchSimilarTourism = async () => {
    if (!tourism) return;
    setSimilarLoading(true);
    setSimilarError("");
    try {
      const response = await tourismAPI.getSimilar(tourism._id);
      setSimilarTourism(response.data.similarTourism || []);
    } catch (err) {
      setSimilarError("Failed to load similar tourism spots");
    } finally {
      setSimilarLoading(false);
    }
  };

  const handleBookVisit = () => {
    if (!isAuthenticated) {
      toast.error("Please login to book a visit");
      navigate("/login");
      return;
    }

    const defaultDate = tourism?.bookingFromDate
      ? new Date(tourism.bookingFromDate).toISOString().split("T")[0]
      : getTodayDate();
    setBookingData({
      bookingDate: defaultDate,
      totalQuantity: 1,
    });
    setShowBookingModal(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    setBookingSuccess("");

    try {
      const totalPrice = tourism.entryFee * bookingData.totalQuantity;

      await bookingAPI.create({
        itemType: "Tourism",
        itemId: tourism._id,
        bookingDate: bookingData.bookingDate,
        totalQuantity: bookingData.totalQuantity,
        totalPrice,
      });

      toast.success("Visit booked successfully!");
      setShowBookingModal(false);
      setTimeout(() => {
        navigate("/my-bookings");
      }, 1500);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Booking failed - check date availability",
      );
    } finally {
      setBookingLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!tourism) return 0;
    return tourism.entryFee * bookingData.totalQuantity;
  };

  const openDirections = () => {
    if (!mapCenter) return;

    const { lat, lng } = mapCenter;

    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, "_blank");
  };

  const closeBookingModal = () => {
    setShowBookingModal(false);
    setBookingData({ bookingDate: "", totalQuantity: 1 });
  };

  const nextImage = () => {
    if (tourism && tourism.images) {
      setCurrentImageIndex((prev) => (prev + 1) % tourism.images.length);
    }
  };

  const prevImage = () => {
    if (tourism && tourism.images) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + tourism.images.length) % tourism.images.length,
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

  const hasMoreAmenities = !!(tourism?.amenities?.length > 4);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !tourism) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Tourism spot not found
        </h2>
        <button
          onClick={() => navigate("/tourism")}
          className="text-blue-600 hover:underline"
        >
          Back to Tourism
        </button>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <button
          onClick={() => navigate("/tourism")}
          className="hidden sm:flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
        >
          <FiArrowLeft className="h-5 w-5" />
          Back to Tourism
        </button>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          {tourism.name}
        </h1>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden pb-20 sm:pb-0">
          <div className="flex flex-col lg:flex-row gap-4 p-3 sm:p-4">
            {/* Left Div - Image */}
            <div className="left-div w-full lg:w-2/3 rounded-xl">
              <div className="h-52 sm:h-64 md:h-80 lg:h-105 bg-gray-200 relative rounded-xl overflow-hidden">
                {tourism.images && tourism.images.length > 0 ? (
                  <img
                    src={tourism.images[0]}
                    alt={tourism.name}
                    className="w-full h-full object-cover rounded-xl transition duration-300 hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <FiCamera className="h-24 w-24" />
                  </div>
                )}

                {/* Tourism Photos Button */}
                {tourism.images && tourism.images.length > 0 && (
                  <button
                    onClick={openPhotoModal}
                    className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 bg-gray-800/70 border border-white text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2 hover:bg-gray-800 transition cursor-pointer"
                  >
                    <span>{tourism.images.length}</span>
                    <span>Tourism Photos</span>
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
                    General Entry
                  </h2>
                </div>
                <span className="bg-blue-50 text-blue-700 text-[10px] uppercase font-bold px-2 py-1 rounded-md tracking-wider">
                  Popular
                </span>
              </div>
              <div className="space-y-2.5 mb-6">
                <div className="flex items-center gap-3 p-2.5 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                  <FiGift className="h-4 w-4 text-gray-600" />
                  <span className="text-emerald-800 text-xs sm:text-sm font-semibold">
                    Flexible Timing Access
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-1 pl-1">
                  <div className="flex items-center gap-2 text-teal-700 text-xs sm:text-sm font-medium">
                    <FiMapPin className="h-4 w-4 text-gray-700" />
                    On-site Guides Available
                  </div>
                  <div className="flex items-center gap-2 text-teal-700 text-xs sm:text-sm font-medium">
                    <FiClock className="h-4 w-4 text-gray-700" />
                    Entry before closing
                  </div>
                  <div className="flex items-center gap-2 text-red-500 text-xs sm:text-sm font-medium">
                    <FiAlertCircle className="h-4 w-4" />
                    Non-Refundable
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3 mb-4">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                  {/* Left: Tourism Details */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wider font-bold">
                      Ticket Details
                    </div>

                    <div className="flex items-center gap-3 text-gray-700 font-semibold bg-gray-50 px-3 py-1.5 rounded-lg w-fit">
                      {/* Person */}
                      <div className="flex items-center gap-1.5">
                        <FiUser className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">Per Person</span>
                      </div>

                      <div className="w-px h-3 bg-gray-300" />

                      {/* Validity */}
                      <div className="flex items-center gap-1.5">
                        <FiCalendar className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">1 Day Access</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Pricing */}
                  <div className="flex flex-col sm:items-end">
                    <div className="flex items-baseline gap-1">
                      <span className="text-gray-900 text-xl font-black tracking-tight">
                        ₹{Number(tourism.entryFee || 0).toLocaleString("en-IN")}
                      </span>
                      <span className="text-gray-500 text-sm font-medium">
                        /person
                      </span>
                    </div>

                    {/* Highlight Tag */}
                    <div className="mt-1.5 flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md border border-emerald-100">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[11px] font-bold uppercase tracking-wide">
                        Instant Entry
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleBookVisit}
                className="w-full bg-blue-600 text-white py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-medium hover:bg-blue-700 transition cursor-pointer text-sm sm:text-base"
              >
                Book Visit
              </button>

              <p className="text-center text-[11px] text-gray-400 mt-3 font-medium">
                Instant Confirmation • Secure Payment
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-6 md:p-8">
            {/* About Tourism Section */}
            <div className="mb-6">
              <h2 className="text-base sm:text-xl font-bold text-gray-800 mb-2">
                About {tourism.name}
              </h2>
              {isDescriptionExpanded ? (
                <>
                  <p className="text-gray-600 leading-relaxed break-words text-sm sm:text-base">
                    {tourism.description}
                  </p>
                  <button
                    onClick={() => setIsDescriptionExpanded(false)}
                    className="mt-2 text-blue-600 hover:underline font-medium text-sm cursor-pointer"
                  >
                    Read less
                  </button>
                </>
              ) : (
                <p className="text-gray-600 transition-all duration-300 leading-relaxed break-words text-sm sm:text-base">
                  {tourism.description
                    ? tourism.description.slice(0, 320) + "..."
                    : ""}
                  <button
                    onClick={() => setIsDescriptionExpanded(true)}
                    className="ml-1 text-blue-600 hover:underline font-medium text-sm cursor-pointer"
                  >
                    Read more
                  </button>
                </p>
              )}
            </div>

            {/* Location and Details */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-3 text-gray-600 mb-6">
              <div className="flex items-center gap-2 min-w-0">
                <MdEventSeat className="h-5 w-5 text-blue-500 shrink-0" />
                <span className="text-sm sm:text-base break-words truncate">
                  {tourism.totalVisitors} Visitors/Day{" "}
                </span>
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <FiMapPin className="h-5 w-5 text-blue-500 shrink-0" />
                <span className="text-sm sm:text-base break-words truncate">
                  {tourism.location}
                </span>
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <FiClock className="h-5 w-5 text-blue-500 shrink-0" />
                <span className="text-sm sm:text-base break-words truncate">
                  {tourism.openTime} - {tourism.closeTime}
                </span>
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <FiCalendar className="h-5 w-5 text-blue-500 shrink-0" />
                <span className="text-sm sm:text-base break-words truncate">
                  {formatTourismDate(
                    tourism.bookingFromDate,
                    tourism.bookingToDate,
                  )}
                </span>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex overflow-x-auto border-b border-gray-200 mb-6 scrollbar-hide gap-2 px-1">
              <button
                onClick={() => setActiveTab("amenities")}
                className={`px-4 py-2 font-medium text-sm whitespace-nowrap shrink-0 cursor-pointer ${activeTab === "amenities" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600 hover:text-gray-800"}`}
              >
                Amenities
              </button>
              <button
                onClick={() => setActiveTab("policies")}
                className={`px-4 py-2 font-medium text-sm whitespace-nowrap shrink-0 cursor-pointer ${activeTab === "policies" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600 hover:text-gray-800"}`}
              >
                Policies
              </button>
              <button
                onClick={() => setActiveTab("location")}
                className={`px-4 py-2 font-medium text-sm whitespace-nowrap shrink-0 cursor-pointer ${activeTab === "location" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600 hover:text-gray-800"}`}
              >
                Location
              </button>
              <button
                onClick={() => setActiveTab("similar")}
                className={`px-4 py-2 font-medium text-sm whitespace-nowrap shrink-0 cursor-pointer ${activeTab === "similar" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600 hover:text-gray-800"}`}
              >
                Similar Spots
              </button>
            </div>

            {/* Tab Content */}
            <div className="min-h-64">
              {activeTab === "amenities" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-gray-800 mb-4">
                      Popular Amenities
                    </h2>
                    {tourism.amenities && tourism.amenities.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {tourism.amenities.map((amenity, index) => (
                          <span
                            key={`highlight-${index}`}
                            className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-indigo-600 italic text-sm mb-6">
                        No amenities listed
                      </p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "policies" && (
                <div>
                  <h2 className="text-lg font-bold text-gray-800 mb-4">
                    Tourism Policies
                  </h2>
                  {tourism.policies && tourism.policies.length > 0 ? (
                    <ul className="list-[circle] pl-5 space-y-2">
                      {tourism.policies.map((policies, index) => (
                        <li
                          key={`policies-${index}`}
                          className="text-gray-700 text-sm leading-relaxed"
                        >
                          {policies}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-indigo-600 italic text-sm mb-6">
                      No specific policies listed for this event.
                    </p>
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
                      <p className="text-gray-800">{tourism.location}</p>
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

                        {/* 🧭 Get Directions Button */}
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
                    Similar Tourism Spots
                  </h2>
                  {similarLoading ? (
                    <div className="flex justify-center items-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : similarError ? (
                    <p className="text-red-600">{similarError}</p>
                  ) : similarTourism.length > 0 ? (
                    <div className="flex sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-x-auto sm:overflow-visible pb-2">
                      {similarTourism.map((spot) => (
                        <div
                          key={spot._id}
                          onClick={() => navigate(`/tourism/${spot._id}`)}
                          className="min-w-[220px] sm:min-w-0 w-full bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer"
                        >
                          <div className="h-40 bg-gray-200 relative">
                            {spot.images && spot.images.length > 0 ? (
                              <img
                                src={spot.images[0]}
                                alt={spot.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <FiCamera className="h-10 w-10" />
                              </div>
                            )}
                            <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium shadow">
                              ₹{spot.entryFee}
                              <span className="text-[10px] sm:text-xs ml-1 text-gray-200">
                                /person
                              </span>
                            </div>
                          </div>

                          <div className="p-3">
                            <h3 className="font-semibold text-gray-800 text-sm line-clamp-1">
                              {spot.name}
                            </h3>
                            <div className="flex gap-1 text-gray-600 text-xs sm:text-sm mt-1 min-w-0">
                              <FiMapPin className="h-3.5 w-3.5 shrink-0 mt-[2px]" />
                              <span className="break-words line-clamp-1">
                                {spot.location}
                              </span>
                            </div>
                            <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 mt-1">
                              {spot.description}
                            </p>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/tourism/${spot._id}`);
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
                    <p className="text-gray-600">No similar spots available</p>
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
                  Book {tourism.name}
                </h3>
                <button
                  onClick={closeBookingModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Visit Date *
                  </label>
                  <input
                    type="date"
                    value={bookingData.bookingDate}
                    onChange={(e) =>
                      setBookingData({
                        ...bookingData,
                        bookingDate: e.target.value,
                      })
                    }
                    required
                    min={
                      tourism?.bookingFromDate
                        ? new Date(tourism.bookingFromDate)
                            .toISOString()
                            .split("T")[0]
                        : getTodayDate()
                    }
                    max={
                      tourism?.bookingToDate
                        ? new Date(tourism.bookingToDate)
                            .toISOString()
                            .split("T")[0]
                        : ""
                    }
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Available:{" "}
                    {formatTourismDate(
                      tourism?.bookingFromDate,
                      tourism?.bookingToDate,
                    )}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Visitors *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={tourism.totalVisitors}
                    value={bookingData.totalQuantity}
                    onChange={(e) =>
                      setBookingData({
                        ...bookingData,
                        totalQuantity: parseInt(e.target.value),
                      })
                    }
                    required
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="bg-gray-50 border rounded-xl p-3 sm:p-4 space-y-2 text-sm sm:text-base">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Price per person:</span>
                    <span className="font-medium text-gray-800">₹{tourism.entryFee}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Total:</span>
                    <span className="font-bold text-lg text-gray-800">
                      ₹{calculateTotal()}
                    </span>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="w-full bg-blue-600 text-white py-2.5 sm:py-3 text-sm sm:text-base rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-medium"
                >
                  {bookingLoading
                    ? "Processing..."
                    : `Confirm Booking ( ₹${calculateTotal()} )`}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Photo Modal */}
        {showPhotoModal && tourism && tourism.images && (
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
                  src={tourism.images[currentImageIndex]}
                  alt={`${tourism.name} - ${currentImageIndex + 1}`}
                  className="w-full max-h-[70vh] object-contain rounded-lg"
                />
                {tourism.images.length > 1 && (
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full"
                  >
                    <FiChevronLeft className="h-6 w-6" />
                  </button>
                )}
                {tourism.images.length > 1 && (
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full"
                  >
                    <FiChevronRight className="h-6 w-6" />
                  </button>
                )}
              </div>
              <div className="text-center text-white mt-4">
                {currentImageIndex + 1} / {tourism.images.length}
              </div>
              {tourism.images.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto justify-center">
                  {tourism.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 ${index === currentImageIndex ? "border-blue-500" : "border-transparent"}`}
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
    </div>
  );
};

export default TourismDetails;
