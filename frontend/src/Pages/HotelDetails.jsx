import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  GoogleMap,
  LoadScript,
  useLoadScript,
  Marker,
} from "@react-google-maps/api";
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
  FiCircle,
  FiNavigation,
  FiChevronLeft,
  FiChevronRight,
  FiCoffee,
  FiZap,
} from "react-icons/fi";
import { MdOutlineBed } from "react-icons/md";

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

  useEffect(() => {
    if (bookingType === "hour" && bookingData.checkIn) {
      const checkInDate = new Date(bookingData.checkIn);

      const checkOut = new Date(
        checkInDate.getTime() + selectedHours * 60 * 60 * 1000,
      );

      setBookingData((prev) => ({
        ...prev,
        checkOut: checkOut.toISOString(),
      }));
    }
  }, [bookingType, selectedHours, bookingData.checkIn]);

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
      console.log("Using precise hotel coordinates:", hotel.coordinates);
    } else if (hotel?.location) {
      // Fallback mock geocoding
      let lat = 21.7679;
      let lng = 72.1359;
      const hash = hotel.location
        .split("")
        .reduce((a, b) => a + b.charCodeAt(0), 0);
      lat += (hash % 100) / 10000;
      lng += ((hash * 31) % 100) / 10000;
      setMapCenter({ lat, lng });
      console.log(
        `Fallback geocoded "${hotel.location}" to [${lat.toFixed(4)}, ${lng.toFixed(4)}]`,
      );
    }
  }, [hotel]);

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
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    setBookingSuccess("");

    try {
      let totalPrice = 0;
      let checkOutDate = bookingData.checkOut;

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

        checkOutDate = checkOut.toISOString();

        const pricePerHour = hotel.pricePerNight / 24;
        totalPrice = pricePerHour * selectedHours * bookingData.rooms;
      }
      await bookingAPI.create({
        itemType: "Hotel",
        itemId: hotel._id,

        bookingType, // ✅ MUST
        hours: bookingType === "hour" ? selectedHours : null, // ✅ MUST

        bookingFromDate: bookingData.checkIn, // ✅ MUST
        bookingToDate: bookingData.checkOut, // ✅ MUST

        totalQuantity: bookingData.rooms,
      });

      toast.success("Hotel booked successfully!");
      setTimeout(() => {
        setBookingSuccess("");
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
        const pricePerHour = hotel.pricePerHour || (hotel.pricePerNight / 24);
        return pricePerHour * selectedHours * bookingData.rooms;
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

  const mapContainerStyle = useMemo(
    () => ({
      height: "400px",
      width: "100%",
    }),
    [],
  );

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
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate("/hotels")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-8"
        >
          <FiArrowLeft className="h-5 w-5" />
          Back to Hotels
        </button>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{hotel.name}</h1>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex flex-row gap-4 p-4 -mb-8">
            {/* Left Div - Image */}
            <div className="left-div w-2/3 rounded-xl">
              <div className="h-90 bg-gray-200 relative rounded-xl">
                {hotel.images && hotel.images.length > 0 ? (
                  <img
                    src={hotel.images[0]}
                    alt={hotel.name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <FiHome className="h-24 w-24" />
                  </div>
                )}

                {/* Property Photos Button */}
                {hotel.images && hotel.images.length > 0 && (
                  <button
                    onClick={openPhotoModal}
                    className="absolute bottom-4 right-4 bg-gray-800/70 border-2 border-white text-white px-4 py-2 rounded-4xl font-medium flex items-center gap-2 hover:bg-gray-800 transition -mb-2 cursor-pointer"
                  >
                    <span>{hotel.images.length}</span>
                    <span>Property Photos</span>
                    <FiArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Right Div - Info */}
            <div className="right-div w-1/3 p-6 bg-gray-100 border border-gray-300 flex flex-col rounded-xl">
              <div className="text-gray-800 text-lg font-bold mb-2">
                Deluxe Room
              </div>
              <div className="flex items-center gap-1 text-teal-700 text-sm font-medium mb-1">
                <FiCoffee className="h-4 w-4 text-gray-700" />
                Complimentary Meal Upgrade
              </div>
              <div className="flex items-center gap-1 text-teal-700 text-sm font-medium mb-1">
                <FiZap className="h-4 w-4 text-gray-700" />
                Enjoy Happy Hours with 1+1 offer
              </div>
              <div className="flex items-center gap-1 text-teal-700 text-sm font-medium mb-1">
                <FiClock className="h-4 w-4 text-gray-700" />
                Early check-in upto 2 hrs
              </div>
              <div className="flex items-center gap-1 text-red-500 text-sm font-medium mb-4">
                <FiAlertCircle className="h-4 w-4" />
                Non-Refundable
              </div>

                  <div className="flex items-baseline justify-between mb-4">
                    <div className="flex items-center gap-1 text-gray-600 text-base font-medium">
                      <FiUser className="h-4 w-4" />
                      2 Guests |
                      <MdOutlineBed className="h-4 w-4" /> 1 Room
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="text-gray-800 text-2xl font-bold">
                        <span>₹</span>
                        {hotel.pricePerNight}
                      </div>
                      <div className="text-gray-600 text-sm font-semibold">
                        Per Night
                      </div>
                      <div className="text-emerald-600 text-sm font-semibold mt-1">
                        Hourly: ₹
                        {(hotel.pricePerHour || (hotel.pricePerNight / 24)).toFixed(0)}/hr
                      </div>
                    </div>
                  </div>

              <button
                onClick={handleBookNow}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-2xl font-medium hover:bg-blue-700 transition cursor-pointer"
              >
                Book Now
              </button>
            </div>
          </div>

          <div className="p-8">
            {/* About Properties Section */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                About Properties
              </h2>
              {isDescriptionExpanded ? (
                <>
                  <p className="text-gray-600">{hotel.description}</p>
                  <button
                    onClick={() => setIsDescriptionExpanded(false)}
                    className="mt-2 text-blue-600 hover:underline font-medium text-sm cursor-pointer"
                  >
                    Read less
                  </button>
                </>
              ) : (
                <p className="text-gray-600">
                  {hotel.description
                    ? hotel.description.slice(0, 320) + "..."
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

            {/* Location and Rooms */}
            <div className="flex items-center justify-start gap-40 text-gray-600 mb-6">
              <div className="flex items-center gap-2">
                <FiMapPin className="h-5 w-5 text-blue-500" />
                <span>{hotel.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <FiHome className="h-5 w-5 text-blue-500" />
                <span>{hotel.totalRooms} Rooms Available</span>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab("amenities")}
                className={`px-4 py-2 font-medium text-sm cursor-pointer ${
                  activeTab === "amenities"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Amenities
              </button>

              <button
                onClick={() => setActiveTab("policies")}
                className={`px-4 py-2 font-medium text-sm cursor-pointer ${
                  activeTab === "policies"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Property Policies
              </button>
              <button
                onClick={() => setActiveTab("location")}
                className={`px-4 py-2 font-medium text-sm cursor-pointer ${
                  activeTab === "location"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Location
              </button>
              <button
                onClick={() => setActiveTab("similar")}
                className={`px-4 py-2 font-medium text-sm cursor-pointer ${
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
                    <h2 className="text-lg font-bold text-gray-800 mb-4">
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

                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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
                      <h3 className="text-md font-bold text-gray-800 mb-3 flex items-center">
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
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
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
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Location
                  </h2>
                  <div className="flex items-start gap-2 mb-4">
                    <FiMapPin className="h-5 w-5 text-gray-600 mt-0.5" />
                    <div>
                      <p className="text-gray-800">{hotel.location}</p>
                    </div>
                  </div>
                  {mapCenter ? (
                    <LoadScript
                      googleMapsApiKey={
                        import.meta.env.VITE_GOOGLE_MAPS_API_KEY
                      }
                    >
                      <div className="relative">
                        <GoogleMap
                          mapContainerStyle={mapContainerStyle}
                          center={mapCenter}
                          zoom={14}
                          options={{
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
                          className="absolute bottom-40 right-2.5 bg-white text-blue-600 p-3 rounded-full shadow-xl hover:bg-blue-400 hover:text-white transition cursor-pointer"
                        >
                          <FiNavigation className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </LoadScript>
                  ) : (
                    <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
                      <p className="text-gray-600">Loading map...</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "similar" && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Similar Properties
                  </h2>
                  {similarLoading ? (
                    <div className="flex justify-center items-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : similarError ? (
                    <p className="text-red-600">{similarError}</p>
                  ) : similarHotels.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {similarHotels.map((hotel) => (
                        <div
                          key={hotel._id}
                          onClick={() => navigate(`/hotels/${hotel._id}`)}
                          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer"
                        >
                          <div className="h-40 bg-gray-200 relative">
                            {hotel.images && hotel.images.length > 0 ? (
                              <img
                                src={hotel.images[0]}
                                alt={hotel.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <FiHome className="h-12 w-12" />
                              </div>
                            )}
                            <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                              ${hotel.pricePerNight}/night
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="font-bold text-gray-800 text-md ">
                              {hotel.name}
                            </h3>
                            <div className="flex items-center text-gray-600 text-sm mb-1">
                              <FiMapPin className="h-3 w-3 mr-1" />
                              {hotel.location}
                            </div>
                            <p className="text-gray-600 text-sm line-clamp-2">
                              {hotel.description}
                            </p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/hotels/${hotel._id}`);
                              }}
                              className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
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

            <button
              onClick={handleBookNow}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium text-lg mt-6"
            >
              Book Now
            </button>
          </div>
        </div>

        {bookingData.checkIn && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  Book {hotel.name}
                </h3>
                <button
                  onClick={() =>
                    setBookingData({ checkIn: "", checkOut: "", rooms: 1 })
                  }
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
                        value={bookingData.checkIn}
                        onChange={(e) =>
                          setBookingData({
                            ...bookingData,
                            checkIn: e.target.value,
                          })
                        }
                        min={getTodayDate()}
                        required
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Check-out Date
                      </label>
                      <input
                        type="date"
                        value={bookingData.checkOut}
                        onChange={(e) =>
                          setBookingData({
                            ...bookingData,
                            checkOut: e.target.value,
                          })
                        }
                        min={bookingData.checkIn || getTodayDate()}
                        required
                        className="w-full px-4 py-2 border rounded-lg"
                      />
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
                          className={`flex-1 py-2 rounded-lg border ${
                            selectedHours === hrs
                              ? "bg-blue-600 text-white"
                              : "bg-white text-gray-700"
                          }`}
                        >
                          {hrs} Hours
                        </button>
                      ))}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">
                        Check-in Time
                      </label>
                      <input
                        type="datetime-local"
                        value={bookingData.checkIn}
                        onChange={(e) =>
                          setBookingData({
                            ...bookingData,
                            checkIn: e.target.value,
                          })
                        }
                        required
                        className="w-full px-4 py-2 border rounded-lg"
                      />
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
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Price per night:</span>
                    <span className="font-medium">${hotel.pricePerNight}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-bold text-lg">
                      ${calculateTotal()}
                    </span>
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

        {/* Photo Modal */}
        {showPhotoModal && hotel && hotel.images && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
            <div className="relative max-w-4xl w-full">
              {/* Close Button */}
              <button
                onClick={closePhotoModal}
                className="absolute -top-12 right-0 text-white text-2xl hover:text-gray-300"
              >
                <FiX className="h-8 w-8" />
              </button>

              {/* Main Image */}
              <div className="relative">
                <img
                  src={hotel.images[currentImageIndex]}
                  alt={`${hotel.name} - ${currentImageIndex + 1}`}
                  className="w-full h-120 object-contain rounded-lg"
                />

                {/* Previous Button */}
                {hotel.images.length > 1 && (
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full"
                  >
                    <FiChevronLeft className="h-6 w-6" />
                  </button>
                )}

                {/* Next Button */}
                {hotel.images.length > 1 && (
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full"
                  >
                    <FiChevronRight className="h-6 w-6" />
                  </button>
                )}
              </div>

              {/* Image Counter */}
              <div className="text-center text-white mt-4">
                {currentImageIndex + 1} / {hotel.images.length}
              </div>

              {/* Thumbnail Strip */}
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
    </div>
  );
};

export default HotelDetails;
