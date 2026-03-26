import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import api, { eventAPI } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaImage,
  FaRupeeSign,
  FaClock,
  FaUsers,
  FaUpload,
  FaSpinner,
  FaPlus,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

const AddEvent = () => {
  const [formData, setFormData] = useState({
    title: "",
    artist: "",
    description: "",
    location: "",
    lat: "",
    lng: "",
    eventType: "one-day",
    eventTime: "",
    eventDate: "",
    bookingFromDate: "",
    bookingToDate: "",
    price: "",
    totalSeats: "",
    images: null,
    amenities: [],
    policies: [],
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [newAmenity, setNewAmenity] = useState("");
  const [newPolicy, setNewPolicy] = useState("");
  const [showAmenitySuggestions, setShowAmenitySuggestions] = useState(false);
  const [showPolicySuggestions, setShowPolicySuggestions] = useState(false);
  const [highlightedAmenityIndex, setHighlightedAmenityIndex] = useState(-1);
  const [highlightedPolicyIndex, setHighlightedPolicyIndex] = useState(-1);
  const { user } = useAuth();

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "images") {
      const newFiles = Array.from(files);
      setImageFiles((prev) => [...prev, ...newFiles]);
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
      setFormData((prev) => ({
        ...prev,
        images: [...(prev.images || []), ...newFiles],
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEventTypeChange = (type) => {
    setFormData((prev) => ({ ...prev, eventType: type }));
    if (type === "one-day" && formData.bookingFromDate) {
      setFormData((prev) => ({ ...prev, bookingToDate: prev.bookingFromDate }));
    }
  };

  const handleEventDateChange = (e) => {
    const date = e.target.value;
    setFormData((prev) => ({
      ...prev,
      eventDate: date,
      bookingFromDate: date,
      bookingToDate: date,
    }));
  };

  const handleRemoveImage = (index) => {
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    const newFiles = imageFiles.filter((_, i) => i !== index);
    setImagePreviews(newPreviews);
    setImageFiles(newFiles);
    setFormData((prev) => ({
      ...prev,
      images: prev.images ? prev.images.filter((_, i) => i !== index) : [],
    }));
    URL.revokeObjectURL(imagePreviews[index]);
  };

  const handleAddMoreImages = (e) => {
    const newFiles = Array.from(e.target.files);
    setImageFiles((prev) => [...prev, ...newFiles]);
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
    setFormData((prev) => ({
      ...prev,
      images: [...(prev.images || []), ...newFiles],
    }));
    e.target.value = "";
  };

  const [loading, setLoading] = useState(false);

  const popularAmenities = [
    "Food & Drinks", "Live Music", "Parking Available", "AC Hall", "Wheelchair Accessible",
    "VIP Seating", "Restrooms", "Drinking Water", "Sound System", "Lighting",
    "Seating Arranged", "Stage", "Dance Floor", "Projector", "WiFi",
    "Power Backup", "Security", "First Aid", "Photo Booth", "Merchandise Stall"
  ];

  const popularPolicies = [
    "No Smoking", "No Outside Food", "Children Free", "Refundable Tickets",
    "ID Required", "No Re-entry", "Pets Not Allowed", "Family Friendly",
    "Non Refundable", "Rain Check Available", "Early Bird Discount",
    "Group Booking Discount", "Students Discount", "Senior Citizens Discount"
  ];

  const handleAmenitiesInput = (e) => {
    setNewAmenity(e.target.value);
    setHighlightedAmenityIndex(-1);
    setShowAmenitySuggestions(e.target.value.length > 0);
  };

  const handleAmenityKeyDown = (e) => {
    const filteredSuggestions = popularAmenities
      .filter((suggestion) =>
        suggestion.toLowerCase().includes(newAmenity.toLowerCase())
      )
      .slice(0, 8);
    const suggestionCount = filteredSuggestions.length;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedAmenityIndex((prev) => 
        prev < suggestionCount - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedAmenityIndex((prev) => 
        prev <= 0 ? suggestionCount - 1 : prev - 1
      );
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (highlightedAmenityIndex >= 0 && highlightedAmenityIndex < suggestionCount) {
        addAmenity(filteredSuggestions[highlightedAmenityIndex]);
      } else {
        addAmenity(newAmenity);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setShowAmenitySuggestions(false);
      setHighlightedAmenityIndex(-1);
    }
  };

  const addAmenity = (amenity) => {
    const trimmed = amenity.trim();
    if (!trimmed || formData.amenities.length >= 20 || formData.amenities.some(a => a.toLowerCase() === trimmed.toLowerCase())) {
      toast.warning("Invalid or duplicate amenity, or max 20 reached.");
      return;
    }
    setFormData(prev => ({ ...prev, amenities: [...prev.amenities, trimmed] }));
    setNewAmenity("");
    setShowAmenitySuggestions(false);
    setHighlightedAmenityIndex(-1);
    toast.success("Amenity added!");
  };

  const removeAmenity = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handlePolicyInput = (e) => {
    setNewPolicy(e.target.value);
    setHighlightedPolicyIndex(-1);
    setShowPolicySuggestions(e.target.value.length > 0);
  };

  const handlePolicyKeyDown = (e) => {
    const filteredSuggestions = popularPolicies
      .filter((suggestion) =>
        suggestion.toLowerCase().includes(newPolicy.toLowerCase())
      )
      .slice(0, 8);
    const suggestionCount = filteredSuggestions.length;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedPolicyIndex((prev) => 
        prev < suggestionCount - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedPolicyIndex((prev) => 
        prev <= 0 ? suggestionCount - 1 : prev - 1
      );
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (highlightedPolicyIndex >= 0 && highlightedPolicyIndex < suggestionCount) {
        addPolicy(filteredSuggestions[highlightedPolicyIndex]);
      } else {
        addPolicy(newPolicy);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setShowPolicySuggestions(false);
      setHighlightedPolicyIndex(-1);
    }
  };

  const addPolicy = (policy) => {
    const trimmed = policy.trim();
    if (!trimmed || formData.policies.length >= 20 || formData.policies.some(p => p.toLowerCase() === trimmed.toLowerCase())) {
      toast.warning("Invalid or duplicate policy, or max 20 reached.");
      return;
    }
    setFormData(prev => ({ ...prev, policies: [...prev.policies, trimmed] }));
    setNewPolicy("");
    setShowPolicySuggestions(false);
    setHighlightedPolicyIndex(-1);
    toast.success("Policy added!");
  };

  const removePolicy = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      policies: prev.policies.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    // Validate lat/lng if provided
    if (formData.lat) {
      const latNum = parseFloat(formData.lat);
      if (isNaN(latNum) || latNum < -90 || latNum > 90) {
        toast.error("Latitude must be between -90 and 90");
        return;
      }
    }
    if (formData.lng) {
      const lngNum = parseFloat(formData.lng);
      if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
        toast.error("Longitude must be between -180 and 180");
        return;
      }
    }

    if (formData.eventType === "one-day") {
      if (!formData.eventDate) {
        toast.error("Please select event date");
        return;
      }
    } else {
      const fromDate = new Date(formData.bookingFromDate);
      const toDate = new Date(formData.bookingToDate);
      if (fromDate > toDate) {
        toast.error("Booking To date must be after Booking From date");
        return;
      }
      if (!formData.bookingFromDate || !formData.bookingToDate) {
        toast.error("Please select valid booking dates");
        return;
      }
    }

    setLoading(true);
    try {
      const submitData = new FormData();
      // Explicit appends
      submitData.append('title', formData.title);
      if (formData.artist) submitData.append('artist', formData.artist);
      if (formData.description) submitData.append('description', formData.description);
      submitData.append('location', formData.location);
      submitData.append('eventType', formData.eventType);
      submitData.append('eventTime', formData.eventTime);
      submitData.append('price', formData.price);
      submitData.append('totalSeats', formData.totalSeats);
      if (formData.eventDate) submitData.append('eventDate', formData.eventDate);
      if (formData.bookingFromDate) submitData.append('bookingFromDate', formData.bookingFromDate);
      if (formData.bookingToDate) submitData.append('bookingToDate', formData.bookingToDate);
      if (formData.lat) submitData.append('lat', formData.lat);
      if (formData.lng) submitData.append('lng', formData.lng);
      // Arrays as JSON
      submitData.append('amenities', JSON.stringify(formData.amenities));
      submitData.append('policies', JSON.stringify(formData.policies));
      // Images
      if (formData.images) {
        formData.images.forEach((image) => {
          submitData.append('images', image);
        });
      }

      await eventAPI.create(submitData);

      toast.success("Event created successfully!");
      navigate("/client/my-events");
    } catch (error) {
      console.error("Failed to create event:", error);
      toast.error(error.response?.data?.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (
      formData.eventType === "one-day" &&
      formData.eventDate &&
      formData.bookingFromDate !== formData.eventDate
    ) {
      setFormData((prev) => ({
        ...prev,
        bookingFromDate: prev.eventDate,
        bookingToDate: prev.eventDate,
      }));
    }
  }, [formData.eventType, formData.eventDate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link
              to="/client/my-events"
              className="flex items-center text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100"
            >
              <FaArrowLeft className="mr-2" />
              Back to My Events
            </Link>
            <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="text-xs font-medium">C</div>
                )}
              </div>
              <span className="font-medium text-gray-900">{user?.name}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-blue-50">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <FaCalendarAlt className="mr-3 text-emerald-600 h-10 w-10" />
              Add New Event
            </h1>
            <p className="text-gray-600 mt-2">
              Create a new event listing for CityPortal
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Title, Artist, Price */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g., Summer Music Festival 2024"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Artist
                </label>
                <input
                  type="text"
                  name="artist"
                  value={formData.artist}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g., Arijit Singh, Sonu Nigam"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price per Seat (₹) *
                </label>
                <div className="relative">
                  <FaRupeeSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    placeholder="500"
                    min="0"
                    step="100"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Description *
              </label>
              <textarea
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-vertical"
                placeholder="Describe your event..."
                required
              />
            </div>

            {/* Location, Coordinates, Time */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <FaMapMarkerAlt className="mr-2 text-gray-500" />
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g., City Center Park, Downtown"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <svg className="mr-2 text-gray-500 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  Latitude
                </label>
                <input
                  type="number"
                  name="lat"
                  value={formData.lat}
                  onChange={handleChange}
                  step="any"
                  min="-90"
                  max="90"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g., 28.6139"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <svg className="mr-2 text-gray-500 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  Longitude
                </label>
                <input
                  type="number"
                  name="lng"
                  value={formData.lng}
                  onChange={handleChange}
                  step="any"
                  min="-180"
                  max="180"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g., 77.2090"
                />
              </div>
              <div className="lg:col-span-3">
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <FaClock className="mr-2 text-gray-500" />
                  Event Time *
                </label>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <TimePicker
                    ampm
                    views={["hours", "minutes"]}
                    value={
                      formData.eventTime
                        ? dayjs(
                            `1970-01-01 ${formData.eventTime}`,
                            "YYYY-MM-DD h:mm A"
                          )
                        : null
                    }
                    onChange={(newValue) => {
                      const timeStr = newValue ? newValue.format("h:mm A") : "";
                      setFormData((prev) => ({ ...prev, eventTime: timeStr }));
                    }}
                    slotProps={{
                      textField: {
                        className:
                          "w-full px-4 py-3 border border-gray-300 rounded-xl focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 shadow-sm text-sm hover:bg-gray-50 transition-all",
                        placeholder: "Select time (e.g., 2:30 PM)",
                        required: true,
                      },
                    }}
                  />
                </LocalizationProvider>
              </div>
            </div>

            <div className="space-y-6">
              {/* Event Duration Toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Event Duration *
                </label>
                <div className="flex bg-gray-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => handleEventTypeChange("one-day")}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                      formData.eventType === "one-day"
                        ? "bg-white shadow-sm border-2 border-emerald-500 text-emerald-700"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    One Day Event
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEventTypeChange("multi-day")}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                      formData.eventType === "multi-day"
                        ? "bg-white shadow-sm border-2 border-emerald-500 text-emerald-700"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Multi-Day Event
                  </button>
                </div>
              </div>

              {/* Dates & Seats */}
              {formData.eventType === "one-day" ? (
                <div className="lg:grid-cols-2 grid grid-cols-1 gap-6 lg:grid">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <FaCalendarAlt className="mr-2 text-gray-500" />
                      Event Date *
                    </label>
                    <input
                      type="date"
                      name="eventDate"
                      value={formData.eventDate}
                      onChange={handleEventDateChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <FaUsers className="mr-2 text-gray-500" />
                      Total Seats *
                    </label>
                    <input
                      type="number"
                      name="totalSeats"
                      value={formData.totalSeats}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                      placeholder="100"
                      min="1"
                      required
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Booking From *
                    </label>
                    <input
                      type="date"
                      name="bookingFromDate"
                      value={formData.bookingFromDate}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Booking To *
                    </label>
                    <input
                      type="date"
                      name="bookingToDate"
                      value={formData.bookingToDate}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                      min={formData.bookingFromDate}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <FaUsers className="mr-2 text-gray-500" />
                      Total Seats *
                    </label>
                    <input
                      type="number"
                      name="totalSeats"
                      value={formData.totalSeats}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                      placeholder="100"
                      min="1"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Event Amenities - VISIBLE FOR BOTH */}             
              <div>               
                <label className="block text-sm font-semibold text-gray-700 mb-3">                  
                  Event Amenities (optional)              
                </label>
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={newAmenity}
                      onChange={handleAmenitiesInput}
                      onKeyDown={handleAmenityKeyDown}
                      placeholder="Type amenity and press Enter (e.g., Food & Drinks)."
                      className="w-full px-4 py-3 pr-24 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => addAmenity(newAmenity)}
                      disabled={!newAmenity.trim()}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Add
                    </button>
                  </div>

                  {showAmenitySuggestions && (
                    <div className="border border-gray-200 rounded-xl bg-white shadow-sm max-h-48 overflow-y-auto">
                      {popularAmenities
                        .filter((suggestion) =>
                          suggestion.toLowerCase().includes(newAmenity.toLowerCase())
                        )
                        .slice(0, 8)
                        .map((suggestion, index) => (
                          <button
                            key={suggestion}
                            type="button"
                            onClick={() => {
                              addAmenity(suggestion);
                              setHighlightedAmenityIndex(-1);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm transition-colors border-b border-gray-100 last:border-b-0 ${
                              index === highlightedAmenityIndex
                                ? 'bg-emerald-100 border-l-4 border-emerald-500 text-emerald-800 font-semibold'
                                : 'hover:bg-emerald-50 hover:text-emerald-700'
                            }`}
                          >
                            {suggestion}
                          </button>
                        ))}
                    </div>
                  )}

                  {formData.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-3 bg-blue-50 rounded-xl">
                      {formData.amenities.map((amenity, index) => (
                        <div
                          key={index}
                          className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                        >
                          {amenity}
                          <button
                            type="button"
                            onClick={() => removeAmenity(index)}
                            className="ml-2 text-blue-600 hover:text-blue-800 p-0.5 rounded-full hover:bg-blue-200 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <span className="text-xs text-gray-500 ml-2">
                        ({formData.amenities.length}/20)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Event Policies */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Event Policies (optional)
                </label>
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={newPolicy}
                      onChange={handlePolicyInput}
                      onKeyDown={handlePolicyKeyDown}
                      placeholder="Type policy and press Enter (e.g., No Smoking)."
                      className="w-full px-4 py-3 pr-24 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => addPolicy(newPolicy)}
                      disabled={!newPolicy.trim()}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Add
                    </button>
                  </div>

                  {showPolicySuggestions && (
                    <div className="border border-gray-200 rounded-xl bg-white shadow-sm max-h-48 overflow-y-auto">
                      {popularPolicies
                        .filter((suggestion) =>
                          suggestion.toLowerCase().includes(newPolicy.toLowerCase())
                        )
                        .slice(0, 8)
                        .map((suggestion, index) => (
                          <button
                            key={suggestion}
                            type="button"
                            onClick={() => {
                              addPolicy(suggestion);
                              setHighlightedPolicyIndex(-1);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm transition-colors border-b border-gray-100 last:border-b-0 ${
                              index === highlightedPolicyIndex
                                ? 'bg-emerald-100 border-l-4 border-emerald-500 text-emerald-800 font-semibold'
                                : 'hover:bg-emerald-50 hover:text-emerald-700'
                            }`}
                          >
                            {suggestion}
                          </button>
                        ))}
                    </div>
                  )}

                  {formData.policies.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-3 bg-green-50 rounded-xl">
                      {formData.policies.map((policy, index) => (
                        <div
                          key={index}
                          className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                        >
                          {policy}
                          <button
                            type="button"
                            onClick={() => removePolicy(index)}
                            className="ml-2 text-green-600 hover:text-green-800 p-0.5 rounded-full hover:bg-green-200 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <span className="text-xs text-gray-500 ml-2">
                        ({formData.policies.length}/20)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Images */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-4 flex items-center">
                  <FaImage className="mr-2 text-gray-500" />
                  Event Images
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-emerald-400 transition-colors">
                  <input
                    type="file"
                    name="images"
                    accept="image/*"
                    multiple
                    onChange={handleChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <FaUpload className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-1">
                      Click to upload
                    </p>
                    <p className="text-sm text-gray-500">
                      PNG, JPG (max 50 images, 10MB each)
                    </p>
                  </label>
                </div>
                {imagePreviews.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-medium text-gray-900">
                        Selected Images ({imagePreviews.length})
                      </h4>
                      <label
                        htmlFor="add-more-images"
                        className="flex items-center text-emerald-600 hover:text-emerald-700 text-sm font-medium cursor-pointer transition-colors"
                      >
                        <FaPlus className="w-4 h-4 mr-1" />
                        Add more
                      </label>
                    </div>
                    <div className="flex gap-3 pb-3 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent max-w-full">
                      {imagePreviews.slice(0, 3).map((preview, index) => (
                        <div
                          key={index}
                          className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden relative bg-gray-100 group hover:shadow-md transition-shadow"
                        >
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-all z-10"
                            title="Remove image"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      {imagePreviews.length > 3 && (
                        <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 font-medium text-sm shadow-sm border">
                          +{imagePreviews.length - 3}
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      id="add-more-images"
                      accept="image/*"
                      multiple
                      onChange={handleAddMoreImages}
                      className="hidden"
                    />
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4 pt-6">
                <Link
                  to="/client/my-events"
                  className="px-8 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium transition flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin h-4 w-4" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Event</span>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEvent;

