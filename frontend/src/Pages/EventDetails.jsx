import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { eventAPI, bookingAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  FiMapPin,
  FiCalendar,
  FiUser,
  FiArrowLeft,
  FiX,
  FiArrowRight,
  FiClock,
  FiAlertCircle,
  FiCircle,
  FiChevronLeft,
  FiChevronRight,
  FiMusic,
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

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingData, setBookingData] = useState({
    bookingFromDate: "",
    bookingToDate: "",
    tickets: 1,
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [activeTab, setActiveTab] = useState("amenities");
  const [similarEvents, setSimilarEvents] = useState([]);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [similarLoading, setSimilarLoading] = useState(false);
  const [similarError, setSimilarError] = useState("");
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [mapCenter, setMapCenter] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchEvent();
  }, [id]);

  useEffect(() => {
    if (activeTab === "similar" && event) {
      fetchSimilarEvents();
    }
  }, [activeTab, event]);

  useEffect(() => {
    if (event?.coordinates?.lat && event?.coordinates?.lng) {
      setMapCenter({
        lat: event.coordinates.lat,
        lng: event.coordinates.lng,
      });
    } else if (event?.location) {
      let lat = 21.7679;
      let lng = 72.1359;
      const hash = event.location
        .split("")
        .reduce((a, b) => a + b.charCodeAt(0), 0);
      lat += (hash % 100) / 10000;
      lng += ((hash * 31) % 100) / 10000;
      setMapCenter({ lat, lng });
    }
  }, [event]);

  const fetchEvent = async () => {
    try {
      const response = await eventAPI.getById(id);
      setEvent(response.data.event);
    } catch (err) {
      setError("Failed to load event details");
    } finally {
      setLoading(false);
    }
  };

  const fetchSimilarEvents = async () => {
    if (!event) return;
    setSimilarLoading(true);
    setSimilarError("");
    try {
      const response = await eventAPI.getSimilar(event._id);
      setSimilarEvents(response.data.similarEvents || []);
    } catch (err) {
      setSimilarError("Failed to load similar events");
    } finally {
      setSimilarLoading(false);
    }
  };

  const handleBookTickets = () => {
    if (!isAuthenticated) {
      toast.error("Please login to book tickets");
      navigate("/login");
      return;
    }

    setBookingData({
      bookingFromDate: event?.bookingFromDate || getTodayDate(),
      bookingToDate: event?.bookingToDate || getTodayDate(),
      tickets: 1,
    });
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    setBookingSuccess("");

    try {
      const totalPrice = event.price * bookingData.tickets;

      await bookingAPI.create({
        itemType: "Event",
        itemId: event._id,
        bookingFromDate: bookingData.bookingFromDate,
        bookingToDate: bookingData.bookingToDate,
        totalQuantity: bookingData.tickets,
        totalPrice,
      });

      toast.success("Tickets booked successfully!");
      setTimeout(() => {
        setBookingSuccess("");
        navigate("/my-bookings");
      }, 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Booking failed");
    } finally {
      setBookingLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!event) return 0;
    return event.price * bookingData.tickets;
  };

  const nextImage = () => {
    if (event && event.images) {
      setCurrentImageIndex((prev) => (prev + 1) % event.images.length);
    }
  };

  const prevImage = () => {
    if (event && event.images) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + event.images.length) % event.images.length,
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

  const hasMoreAmenities = !!(event?.amenities?.length > 4); // Assume amenities field

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Event not found
        </h2>
        <button
          onClick={() => navigate("/events")}
          className="text-blue-600 hover:underline"
        >
          Back to Events
        </button>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate("/events")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-8"
        >
          <FiArrowLeft className="h-5 w-5" />
          Back to Events
        </button>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{event.title}</h1>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex flex-row gap-4 p-4 -mb-8">
            {/* Left Div - Image */}
            <div className="left-div w-2/3 rounded-xl">
              <div className="h-90 bg-gray-200 relative rounded-xl">
                {event.images && event.images.length > 0 ? (
                  <img
                    src={event.images[0]}
                    alt={event.title}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <FiMusic className="h-24 w-24" />
                  </div>
                )}

                {/* Event Photos Button */}
                {event.images && event.images.length > 0 && (
                  <button
                    onClick={openPhotoModal}
                    className="absolute bottom-4 right-4 bg-gray-800/70 border-2 border-white text-white px-4 py-2 rounded-4xl font-medium flex items-center gap-2 hover:bg-gray-800 transition -mb-2 cursor-pointer"
                  >
                    <span>{event.images.length}</span>
                    <span>Event Photos</span>
                    <FiArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Right Div - Info */}
            <div className="right-div w-1/3 p-6 bg-gray-100 border border-gray-300 flex flex-col rounded-xl">
              <div className="text-gray-800 text-lg font-bold mb-2">
                General Ticket
              </div>
              <div className="flex items-center gap-1 text-teal-700 text-sm font-medium mb-1">
                <FiGift className="h-4 w-4 text-gray-700" />
                Free Refreshments
              </div>
              <div className="flex items-center gap-1 text-teal-700 text-sm font-medium mb-1">
                <FiMusic className="h-4 w-4 text-gray-700" />
                Live Music Experience
              </div>
              <div className="flex items-center gap-1 text-teal-700 text-sm font-medium mb-1">
                <FiClock className="h-4 w-4 text-gray-700" />
                Doors open 1 hr early
              </div>
              <div className="flex items-center gap-1 text-red-500 text-sm font-medium mb-4">
                <FiAlertCircle className="h-4 w-4" />
                Non-Refundable
              </div>

              <div className="flex items-baseline justify-between mb-4">
                <div className="flex items-center gap-1 text-gray-600 text-base font-medium">
                  <MdEventSeat className="h-4 w-4" />
                  {event.totalSeats} Seats |
                  <FiClock className="h-4 w-4" /> {event.eventTime}
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-gray-800 text-2xl font-bold">
                    <span>₹</span>
                    {event.price}
                  </div>
                  <div className="text-gray-600 text-sm font-semibold">
                    Per Ticket
                  </div>
                </div>
              </div>

              <button
                onClick={handleBookTickets}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-2xl font-medium hover:bg-blue-700 transition cursor-pointer"
              >
                Book Tickets
              </button>
            </div>
          </div>

          <div className="p-8">
            {/* About Event Section */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                About Event
              </h2>
              {isDescriptionExpanded ? (
                <>
                  <p className="text-gray-600">{event.description}</p>
                  <button
                    onClick={() => setIsDescriptionExpanded(false)}
                    className="mt-2 text-blue-600 hover:underline font-medium text-sm cursor-pointer"
                  >
                    Read less
                  </button>
                </>
              ) : (
                <p className="text-gray-600">
                  {event.description
                    ? event.description.slice(0, 320) + "..."
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
            <div className="flex items-center justify-start gap-40 text-gray-600 mb-6">
              <div className="flex items-center gap-2">
                <FiMapPin className="h-5 w-5 text-blue-500" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <FiCalendar className="h-5 w-5 text-blue-500" />
                <span>
                  {new Date(event.bookingFromDate).toLocaleDateString()} -{" "}
                  {new Date(event.bookingToDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab("amenities")}
                className={`px-4 py-2 font-medium text-sm cursor-pointer ${activeTab === "amenities" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600 hover:text-gray-800"}`}
              >
                Amenities
              </button>
              <button
                onClick={() => setActiveTab("policies")}
                className={`px-4 py-2 font-medium text-sm cursor-pointer ${activeTab === "policies" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600 hover:text-gray-800"}`}
              >
                Event Policies
              </button>
              <button
                onClick={() => setActiveTab("location")}
                className={`px-4 py-2 font-medium text-sm cursor-pointer ${activeTab === "location" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600 hover:text-gray-800"}`}
              >
                Location
              </button>
              <button
                onClick={() => setActiveTab("similar")}
                className={`px-4 py-2 font-medium text-sm cursor-pointer ${activeTab === "similar" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600 hover:text-gray-800"}`}
              >
                Similar Events
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
                    {event.amenities && event.amenities.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {event.amenities.map((amenity, index) => (
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
                        No amenities available
                      </p>
                    )}
                  </div>
                  {/* Simplified amenities grid - adapt if more fields exist */}
                  <div className="p-4 rounded-xl bg-gray-50">
                    <h3 className="text-md font-bold text-gray-800 mb-3">
                      Event Features
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center p-2 bg-gray-100 rounded-2xl shadow-sm">
                        <div className="w-2 h-2 bg-gray-600 rounded-full mr-3 flex-shrink-0"></div>
                        <span className="text-sm text-gray-600">
                          Live Entertainment
                        </span>
                      </div>
                      <div className="flex items-center p-2 bg-gray-100 rounded-2xl shadow-sm">
                        <div className="w-2 h-2 bg-gray-600 rounded-full mr-3 shrink-0"></div>
                        <span className="text-sm text-gray-600">
                          Networking Opportunities
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "policies" && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Event Policies
                  </h2>
                  {event.policies && event.policies.length > 0 ? (
                      <ul className="list-[circle] pl-5 space-y-2">
                        {event.policies.map((policy, index) => (
                          <li
                            key={`policy-${index}`}
                            className="text-gray-700 text-sm leading-relaxed"
                          >
                            {policy}
                          </li>
                        ))}
                      </ul>
                  ) : (
                    <p className="text-gray-600 italic">
                      No specific policies listed for this event.
                    </p>
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
                      <p className="text-gray-800">{event.location}</p>
                    </div>
                  </div>
                  {mapCenter ? (
                    <LoadScript
                      googleMapsApiKey={
                        import.meta.env.VITE_GOOGLE_MAPS_API_KEY
                      }
                    >
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
                    Similar Events
                  </h2>
                  {similarLoading ? (
                    <div className="flex justify-center items-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : similarError ? (
                    <p className="text-red-600">{similarError}</p>
                  ) : similarEvents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {similarEvents.map((evt) => (
                        <div
                          key={evt._id}
                          onClick={() => navigate(`/events/${evt._id}`)}
                          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer"
                        >
                          <div className="h-40 bg-gray-200 relative">
                            {evt.images && evt.images.length > 0 ? (
                              <img
                                src={evt.images[0]}
                                alt={evt.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <FiMusic className="h-12 w-12" />
                              </div>
                            )}
                            <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                              ₹{evt.price}/ticket
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="font-bold text-gray-800 text-md">
                              {evt.title}
                            </h3>
                            <div className="flex items-center text-gray-600 text-sm mb-1">
                              <FiMapPin className="h-3 w-3 mr-1" />
                              {evt.location}
                            </div>
                            <p className="text-gray-600 text-sm line-clamp-2">
                              {evt.description}
                            </p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/events/${evt._id}`);
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
                    <p className="text-gray-600">No similar events available</p>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={handleBookTickets}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium text-lg mt-6"
            >
              Book Tickets
            </button>
          </div>
        </div>

        {bookingData.bookingFromDate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  Book {event.title}
                </h3>
                <button
                  onClick={() =>
                    setBookingData({
                      bookingFromDate: "",
                      bookingToDate: "",
                      tickets: 1,
                    })
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

              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Start Date
                  </label>
                  <input
                    type="date"
                    value={bookingData.bookingFromDate}
                    onChange={(e) =>
                      setBookingData({
                        ...bookingData,
                        bookingFromDate: e.target.value,
                      })
                    }
                    required
                    min={getTodayDate()}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event End Date
                  </label>
                  <input
                    type="date"
                    value={bookingData.bookingToDate}
                    onChange={(e) =>
                      setBookingData({
                        ...bookingData,
                        bookingToDate: e.target.value,
                      })
                    }
                    required
                    min={bookingData.bookingFromDate || getTodayDate()}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Tickets
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={event.totalSeats}
                    value={bookingData.tickets}
                    onChange={(e) =>
                      setBookingData({
                        ...bookingData,
                        tickets: parseInt(e.target.value),
                      })
                    }
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Price per ticket:</span>
                    <span className="font-medium">₹{event.price}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-bold text-lg">
                      ₹{calculateTotal()}
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
        {showPhotoModal && event && event.images && (
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
                  src={event.images[currentImageIndex]}
                  alt={`${event.title} - ${currentImageIndex + 1}`}
                  className="w-full h-120 object-contain rounded-lg"
                />
                {event.images.length > 1 && (
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full"
                  >
                    <FiChevronLeft className="h-6 w-6" />
                  </button>
                )}
                {event.images.length > 1 && (
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full"
                  >
                    <FiChevronRight className="h-6 w-6" />
                  </button>
                )}
              </div>
              <div className="text-center text-white mt-4">
                {currentImageIndex + 1} / {event.images.length}
              </div>
              {event.images.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto justify-center">
                  {event.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 ${index === currentImageIndex ? "border-blue-500" : "border-transparent"}`}
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

export default EventDetails;
