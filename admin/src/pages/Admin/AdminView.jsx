import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
import api from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  FaArrowLeft,
  FaUser,
  FaUsers,
  FaHotel,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaImage,
  FaRupeeSign,
  FaClock,
  FaBed,
  FaUtensils,
  FaSpinner,
  FaPhone,
  FaEnvelope,
  FaAlignLeft,
  FaMapPin,
} from "react-icons/fa";
import { toast } from "react-toastify";

const AdminView = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [itemData, setItemData] = useState(null);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [activeSubAmenityTab, setActiveSubAmenityTab] = useState("basic");
  const [loading, setLoading] = useState(true);

  const typeConfig = {
    client: {
      title: "Client Details",
      icon: FaUser,
      apiPath: `/admin/clients/${id}`,
      fieldMap: {
        title: "name",
        email: "email",
        phone: "phone",
        address: "address",
      },
      hasImages: false,
    },
    hotel: {
      title: "Hotel Details",
      icon: FaHotel,
      apiPath: `/hotels/${id}`,
      fieldMap: {
        title: "name",
        price: "pricePerNight",
        capacity: "totalRooms",
        extra: "amenities",
      },
      hasImages: true,
    },
    event: {
      title: "Event Details",
      icon: FaCalendarAlt,
      apiPath: `/events/${id}`,
      fieldMap: {
        title: "title",
        price: "price",
        capacity: "totalSeats",
      },
      hasImages: true,
    },
    tourism: {
      title: "Tourism Details",
      icon: FaMapMarkerAlt,
      apiPath: `/tourism/${id}`,
      fieldMap: {
        title: "name",
        price: "entryFee",
        capacity: "totalVisitors",
        openTime: "openTime",
        closeTime: "closeTime",
      },
      hasImages: true,
    },
    blog: {
      title: "Blog Post Details",
      icon: FaAlignLeft,
      apiPath: `/blogs/${id}`, // correct endpoint
      fieldMap: {
        title: "title",
      },
      hasImages: false,
    },
  };

  const config = typeConfig[type] || typeConfig.client;
  const isClient = type === "client";

  const location = useLocation();
  const backRoutes = {
    client: { path: "/admin/clients", label: "Clients" },
    hotel: { path: "/admin/hotels", label: "Hotels" },
    event: { path: "/admin/events", label: "Events" },
    tourism: { path: "/admin/tourism", label: "Tourism" },
    blog: { path: "/admin/blogs", label: "Blog" },
  };
  const defaultBack = backRoutes[type] || {
    path: "/admin-dashboard",
    label: "Dashboard",
  };
  const backPath = location.state?.from || defaultBack.path;
  const backLabel = location.state?.fromLabel || defaultBack.label;

  const safeArray = (val) => (Array.isArray(val) ? val : []);
  const mapApiDataToView = (apiData) => {
    const map = config.fieldMap;

    return {
      title: apiData?.[map.title] ?? "",
      description: apiData?.description ?? "",
      location: apiData?.location ?? "",
      lat: apiData?.coordinates?.lat?.toString() ?? "",
      lng: apiData?.coordinates?.lng?.toString() ?? "",
      price: apiData?.[map.price] ?? "",
      capacity: apiData?.[map.capacity] ?? "",

      amenities: safeArray(apiData?.amenities),
      policies: safeArray(apiData?.policies),

      basicFacilities: safeArray(apiData?.basicFacilities),
      roomAmenities: safeArray(apiData?.roomAmenities),
      healthWellness: safeArray(apiData?.healthWellness),
      safetySecurity: safeArray(apiData?.safetySecurity),

      images: safeArray(apiData?.images),
      profilePicture: apiData?.profilePicture ?? "",

      ...(type === "event" && {
        artist: apiData?.artist ?? "",
        eventType: apiData?.eventDate ? "one-day" : "multi-day",
        eventTime: apiData?.eventTime ?? "",
        eventDate: formatDate(apiData?.eventDate),
        bookingFromDate: formatDate(apiData?.bookingFromDate),
        bookingToDate: formatDate(apiData?.bookingToDate),
      }),

      ...(type === "client" && {
        email: apiData?.email ?? "",
        phone: apiData?.phone ?? "",
        address: apiData?.address ?? "",
      }),

      ...(type === "tourism" && {
        openTime: apiData?.openTime ?? "",
        closeTime: apiData?.closeTime ?? "",
        bookingFromDate: formatDate(apiData.bookingFromDate),
        bookingToDate: formatDate(apiData.bookingToDate),
      }),
      ...(type === "blog" && {
        // ← ADD THIS BLOCK
        excerpt: apiData?.excerpt ?? "",
        author: apiData?.author ?? "",
        category: apiData?.category ?? "",
        publishDate: apiData?.date
          ? new Date(apiData.date).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : "",
        createdAt: apiData?.createdAt
          ? new Date(apiData.createdAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : "",
      }),
    };
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  useEffect(() => {
    if (!id || !config) {
      toast.error("Invalid type or ID");
      navigate("/admin-dashboard");
      return;
    }

    const fetchItem = async () => {
      try {
        const response = await api.get(config.apiPath);
        const getApiItem = (data) => {
          switch (type) {
            case "blog":
              return data.data || data.blog || data;
            case "event":
              return data.event;
            case "hotel":
              return data.hotel;
            case "tourism":
              return data.tourism;
            case "client":
              return data.client;
            default:
              return data;
          }
        };

        const apiItem = getApiItem(response.data);
        const viewData = mapApiDataToView(apiItem);
        setItemData(viewData);

        setImagePreviews(apiItem.images || []);
      } catch (error) {
        console.error(`Failed to load ${type}:`, error);
        toast.error(`Failed to load ${type} data`);
        navigate("/admin-dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id, type, config, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <FaSpinner className="h-12 w-12 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!itemData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center p-8">
          <config.icon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Item not found
          </h2>
          <Link
            to={backPath}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to {backLabel}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link
              to={backPath}
              className="flex items-center text-gray-600 hover:text-gray-900 p-3 rounded-xl hover:bg-gray-100 transition-all"
            >
              <FaArrowLeft className="mr-2 h-5 w-5" />
              Back to {backLabel}
            </Link>
            <div className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-100">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-emerald-100 border-2 border-emerald-200">
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-emerald-500 flex items-center justify-center text-white font-semibold text-xs">
                    {user?.name?.[0] || "A"}
                  </div>
                )}
              </div>
              <span className="font-semibold text-gray-900 hidden sm:inline">
                {user?.name}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-200">
          <div className="px-8 py-8 border-b border-gray-200 bg-gradient-to-r from-emerald-50 via-blue-50 to-purple-50">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/80 rounded-2xl shadow-lg border">
                {React.createElement(config.icon, {
                  className: "h-10 w-10 text-emerald-600",
                })}
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                  {config.title}
                </h1>
                <p className="text-lg text-gray-600 mt-1">View details</p>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Title/Price Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <label className="block text-base font-semibold text-gray-800 mb-2">
                  {type === "client"
                    ? "Name"
                    : type === "hotel"
                      ? "Hotel Name"
                      : type === "event"
                        ? "Event Title"
                        : type === "Tourism Name"
                          ? "Tourism Name"
                          : type === "blog"
                            ? "Blog Title"
                            : "Title"}
                </label>
                <div className="px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-base text-gray-900">
                  {itemData.title}
                </div>
              </div>
              {!isClient && type !== "blog" && itemData.price !== undefined && (
                <div>
                  <label className="text-base font-semibold text-gray-800 mb-2 flex items-center">
                    <FaRupeeSign className="mr-2 text-emerald-600" />
                    {type === "hotel"
                      ? "Price per Night"
                      : type === "event"
                        ? "Price per Pass"
                        : "Entry Fee"}
                  </label>
                  <div className="px-5 py-4 bg-emerald-50 border-2 border-emerald-200 rounded-2xl text-base font-semibold text-emerald-800 flex items-center">
                    ₹{itemData.price}
                  </div>
                </div>
              )}
            </div>

            {/* Artist Section for Events */}
            {type === "event" && itemData.artist && (
              <div>
                <label className="text-base font-semibold text-gray-800 mb-2 flex items-center">
                  <FaUser className="mr-2 text-indigo-600" />
                  Artist
                </label>
                <div className="px-5 py-4 bg-indigo-50 border-2 border-indigo-200 rounded-2xl text-base font-semibold text-indigo-800">
                  {itemData.artist}
                </div>
              </div>
            )}

            {/* Location/Capacity Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {type !== "client" && type !== "blog" && (
                <div>
                  <label className="text-base font-semibold text-gray-800 mb-2 flex items-center">
                    <FaMapPin className="mr-2 text-blue-600" />
                    Location
                  </label>
                  <div className="space-y-2">
                    <div className="px-5 py-4 bg-blue-50 border-2 border-blue-200 rounded-2xl text-base text-gray-900">
                      {itemData.location}
                    </div>
                    {itemData.lat && itemData.lng && (
                      <div className="text-xs text-blue-700 font-mono bg-blue-100 px-3 py-1 rounded-lg border">
                        📍 {parseFloat(itemData.lat).toFixed(6)},{" "}
                        {parseFloat(itemData.lng).toFixed(6)}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {!isClient &&
                type !== "blog" &&
                itemData.capacity !== undefined && (
                  <div>
                    <label className="text-base font-semibold text-gray-800 mb-2 flex items-center">
                      <FaUsers className="mr-2 text-purple-600" />
                      {type === "hotel"
                        ? "Total Rooms"
                        : type === "event"
                          ? "Total Seats"
                          : "Total Visitors per day"}
                    </label>
                    <div className="px-5 py-4 bg-purple-50 border-2 border-purple-200 rounded-2xl text-base font-semibold text-purple-900">
                      {itemData.capacity}
                    </div>
                  </div>
                )}
            </div>

            {/* Client Specific Fields */}
            {type === "client" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="-mt-10">
                  <label className="text-base font-semibold text-gray-800 mb-2 flex items-center">
                    <FaEnvelope className="mr-2 text-orange-600" />
                    Email
                  </label>
                  <div className="px-5 py-4 bg-orange-50 border-2 border-orange-200 rounded-2xl text-base text-gray-900">
                    {itemData.email}
                  </div>
                </div>
                <div className="-mt-10">
                  <label className="text-base font-semibold text-gray-800 mb-2 flex items-center">
                    <FaPhone className="mr-2 text-green-600" />
                    Phone
                  </label>
                  <div className="px-5 py-4 bg-green-50 border-2 border-green-200 rounded-2xl text-base text-gray-900">
                    {itemData.phone}
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            {itemData.description && (
              <div>
                <label className="block text-base font-semibold text-gray-800 mb-2">
                  Description
                </label>
                <div className="px-5 py-6 bg-gray-50 border-2 border-gray-200 rounded-2xl prose max-w-none text-base leading-relaxed">
                  {itemData.description}
                </div>
              </div>
            )}

            {/* Blog Specific Fields */}
            {type === "blog" && (
              <div className="space-y-6">
                {/* Excerpt */}
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-2 -mt-10">
                    Excerpt
                  </label>
                  <div className="px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl prose max-w-none text-base leading-relaxed">
                    {itemData.excerpt || "-"}
                  </div>
                </div>

                {/* Author & Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-base font-semibold text-gray-800 mb-2">
                      Author
                    </label>
                    <div className="px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-base text-gray-900">
                      {itemData.author || "-"}
                    </div>
                  </div>
                  <div>
                    <label className="block text-base font-semibold text-gray-800 mb-2">
                      Category
                    </label>
                    <div className="px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-base text-gray-900">
                      {itemData.category || "-"}
                    </div>
                  </div>
                </div>

                {/* Publish Date */}
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-2">
                    Publish Date
                  </label>
                  <div className="px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-base text-gray-900">
                    {itemData.publishDate || "-"}
                  </div>
                </div>
              </div>
            )}

            {/* Amenities Section */}
            {!isClient && type !== "blog" && (
              <div>
                <label className="text-base font-semibold text-gray-800 mb-2 flex items-center">
                  Amenities
                </label>
                <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl mb-4">
                  {itemData.amenities &&
                  Array.isArray(itemData.amenities) &&
                  itemData.amenities.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {itemData.amenities.map((amenity, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 rounded-full text-sm font-medium shadow-sm border border-indigo-200"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-indigo-500 italic text-base">
                      No amenities listed
                    </p>
                  )}
                </div>

                {/* Sub-Amenities Section for Hotels */}
                {type === "hotel" && (
                  <div>
                    <label className="text-base font-semibold text-gray-800 flex items-center">
                      Sub-Amenities
                    </label>
                    <div className="mb-2">
                      <div className="flex border-b border-gray-200 mb-2">
                        <button
                          type="button"
                          onClick={() => setActiveSubAmenityTab("basic")}
                          className={`px-4 py-2 font-medium text-sm -mb-px ${
                            activeSubAmenityTab === "basic"
                              ? "text-indigo-600 border-b-2 border-indigo-600"
                              : "text-gray-600 hover:text-gray-800"
                          }`}
                        >
                          Basic Facilities
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveSubAmenityTab("room")}
                          className={`px-4 py-2 font-medium text-sm -mb-px ${
                            activeSubAmenityTab === "room"
                              ? "text-purple-600 border-b-2 border-purple-600"
                              : "text-gray-600 hover:text-gray-800"
                          }`}
                        >
                          Room Amenities
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveSubAmenityTab("health")}
                          className={`px-4 py-2 font-medium text-sm -mb-px ${
                            activeSubAmenityTab === "health"
                              ? "text-green-600 border-b-2 border-green-600"
                              : "text-gray-600 hover:text-gray-800"
                          }`}
                        >
                          Health & Wellness
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveSubAmenityTab("safety")}
                          className={`px-4 py-2 font-medium text-sm -mb-px ${
                            activeSubAmenityTab === "safety"
                              ? "text-red-600 border-b-2 border-red-600"
                              : "text-gray-600 hover:text-gray-800"
                          }`}
                        >
                          Safety & Security
                        </button>
                      </div>
                    </div>

                    {/* Tab Contents */}
                    <div className="space-y-4 mb-6">
                      {activeSubAmenityTab === "basic" && (
                        <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl">
                          {itemData.basicFacilities &&
                          Array.isArray(itemData.basicFacilities) &&
                          itemData.basicFacilities.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {itemData.basicFacilities.map(
                                (facility, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-3 py-1.5 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium shadow-sm border border-indigo-200"
                                  >
                                    {facility}
                                  </span>
                                ),
                              )}
                            </div>
                          ) : (
                            <p className="text-indigo-500 italic text-sm">
                              No basic facilities listed
                            </p>
                          )}
                        </div>
                      )}

                      {activeSubAmenityTab === "room" && (
                        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl">
                          {itemData.roomAmenities &&
                          Array.isArray(itemData.roomAmenities) &&
                          itemData.roomAmenities.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {itemData.roomAmenities.map((amenity, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-3 py-1.5 bg-purple-100 text-purple-800 rounded-full text-sm font-medium shadow-sm border border-purple-200"
                                >
                                  {amenity}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-indigo-500 italic text-sm">
                              No room amenities listed
                            </p>
                          )}
                        </div>
                      )}

                      {activeSubAmenityTab === "health" && (
                        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl">
                          {itemData.healthWellness &&
                          Array.isArray(itemData.healthWellness) &&
                          itemData.healthWellness.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {itemData.healthWellness.map((item, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-medium shadow-sm border border-green-200"
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-indigo-500 italic text-sm">
                              No health & wellness features listed
                            </p>
                          )}
                        </div>
                      )}

                      {activeSubAmenityTab === "safety" && (
                        <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl">
                          {itemData.safetySecurity &&
                          Array.isArray(itemData.safetySecurity) &&
                          itemData.safetySecurity.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {itemData.safetySecurity.map((item, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-3 py-1.5 bg-red-100 text-red-800 rounded-full text-sm font-medium shadow-sm border border-red-200"
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-indigo-500 italic text-sm">
                              No safety & security features listed
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Policies Section */}
                <div>
                  <label className="text-base font-semibold text-gray-800 mb-2 flex items-center">
                    Policies
                  </label>
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl">
                    {itemData.policies &&
                    Array.isArray(itemData.policies) &&
                    itemData.policies.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {itemData.policies.map((policy, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 rounded-full text-sm font-medium shadow-sm border border-blue-200"
                          >
                            {policy}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-indigo-500 italic text-sm">
                        No policies listed
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Event Specific */}
            {type === "event" && (
              <>
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-2">
                    Event Type
                  </label>
                  <div
                    className={`px-4 py-3 rounded-2xl font-semibold shadow-sm ${
                      itemData.eventType === "one-day"
                        ? "bg-blue-100 border-2 border-blue-300 text-blue-800"
                        : "bg-purple-100 border-2 border-purple-300 text-purple-800"
                    }`}
                  >
                    {itemData.eventType === "one-day"
                      ? "One Day Event"
                      : "Multi-Day Event"}
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {itemData.eventType === "one-day" ? (
                    <div>
                      <label className="font-semibold text-gray-800 mb-3 flex items-center">
                        <FaCalendarAlt className="mr-2 text-orange-500" />
                        Event Date
                      </label>
                      <div className="px-4 py-3 bg-orange-50 border-2 border-orange-200 rounded-2xl font-medium text-orange-800">
                        {itemData.eventDate}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block font-semibold text-gray-800 mb-2">
                          Booking From
                        </label>
                        <div className="px-4 py-3 bg-blue-50 border-2 border-blue-200 rounded-2xl font-medium text-blue-800">
                          {itemData.bookingFromDate}
                        </div>
                      </div>
                      <div>
                        <label className="block font-semibold text-gray-800 mb-2">
                          Booking To
                        </label>
                        <div className="px-4 py-3 bg-purple-50 border-2 border-purple-200 rounded-2xl font-medium text-purple-800">
                          {itemData.bookingToDate}
                        </div>
                      </div>
                    </>
                  )}
                  <div>
                    <label className="font-semibold text-gray-800 mb-3 flex items-center">
                      <FaClock className="mr-2 text-indigo-500" />
                      Event Time
                    </label>
                    <div className="px-4 py-3 bg-indigo-50 border-2 border-indigo-200 rounded-2xl font-medium text-indigo-800">
                      {itemData.eventTime}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Tourism Dates & Timings */}
            {type === "tourism" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="font-semibold text-gray-800 mb-2 flex items-center">
                      <FaCalendarAlt className="mr-2 text-blue-500" />
                      Booking From Date
                    </label>
                    <div className="px-4 py-3 bg-blue-50 border-2 border-blue-200 rounded-2xl font-medium text-blue-800">
                      {formatDate(itemData.bookingFromDate) || "Not set"}
                    </div>
                  </div>
                  <div>
                    <label className="font-semibold text-gray-800 mb-2 flex items-center">
                      <FaCalendarAlt className="mr-2 text-purple-500" />
                      Booking To Date
                    </label>
                    <div className="px-4 py-3 bg-purple-50 border-2 border-purple-200 rounded-2xl font-medium text-purple-800">
                      {formatDate(itemData.bookingToDate) || "Not set"}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="font-semibold text-gray-800 mb-2 flex items-center">
                      <FaClock className="mr-2 text-indigo-500" />
                      Open Time
                    </label>
                    <div className="px-4 py-3 bg-indigo-50 border-2 border-indigo-200 rounded-2xl font-medium text-indigo-800">
                      {itemData.openTime || "Not set"}
                    </div>
                  </div>
                  <div>
                    <label className="font-semibold text-gray-800 mb-2 flex items-center">
                      <FaClock className="mr-2 text-orange-500" />
                      Close Time
                    </label>
                    <div className="px-4 py-3 bg-orange-50 border-2 border-orange-200 rounded-2xl font-medium text-orange-800">
                      {itemData.closeTime || "Not set"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Client Profile Picture */}
            {type === "client" && itemData.profilePicture && (
              <div>
                <label className="text-base font-semibold text-gray-800 mb-5 flex items-center">
                  <FaImage className="mr-3 h-7 w-7 text-blue-500" />
                  Profile Picture
                </label>
                <div className="flex justify-center">
                  <img
                    src={itemData.profilePicture}
                    alt="Profile"
                    className="max-w-md max-h-96 object-cover rounded-2xl shadow-2xl border-4 border-gray-200"
                  />
                </div>
              </div>
            )}

            {/* Images Gallery */}
            {(imagePreviews.length > 0 ||
              (type === "hotel" && itemData.images?.length > 0)) && (
              <div>
                <label className="text-base font-semibold text-gray-800 mb-4 flex items-center">
                  <FaImage className="mr-3 h-7 w-7 text-blue-500" />
                  {type === "hotel"
                    ? "Hotel Images"
                    : type === "event"
                      ? "Event Images"
                      : "Tourism Images"}{" "}
                  ({imagePreviews.length})
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {imagePreviews.map((imgSrc, idx) => (
                    <div
                      key={idx}
                      className="group relative overflow-hidden rounded-2xl shadow-lg bg-gradient-to-br from-gray-50 to-gray-100 aspect-square hover:shadow-2xl transition-all"
                    >
                      <img
                        src={imgSrc}
                        alt={`Image ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-center pt-8 border-t border-gray-200">
              <Link
                to={backPath}
                className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-4 px-12 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl hover:-translate-y-0.5 transition-all flex items-center space-x-3"
              >
                <FaArrowLeft className="h-5 w-5" />
                Back to {backLabel}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminView;
