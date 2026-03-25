import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { hotelAPI } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  FaHotel,
  FaArrowLeft,
  FaSpinner,
  FaImage,
  FaMapMarkerAlt,
  FaDollarSign,
  FaCalendarAlt,
  FaUser,
  FaPlus,
} from "react-icons/fa";
import { toast } from "react-toastify";

const AddHotel = () => {
const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    lat: "",
    lng: "",
    pricePerNight: "",
    totalRooms: "",
    amenities: [],
    basicFacilities: [],
    roomAmenities: [],
    healthWellness: [],
    safetySecurity: [],
    policies: [],
    images: [],
  });
  const [newAmenity, setNewAmenity] = useState("");
  const [newBasicFacility, setNewBasicFacility] = useState("");
  const [newRoomAmenity, setNewRoomAmenity] = useState("");
  const [newHealthItem, setNewHealthItem] = useState("");
  const [newSafetyItem, setNewSafetyItem] = useState("");
  const [newPolicy, setNewPolicy] = useState("");
  const [showAmenitySuggestions, setShowAmenitySuggestions] = useState(false);
  const [showBasicSuggestions, setShowBasicSuggestions] = useState(false);
  const [showRoomSuggestions, setShowRoomSuggestions] = useState(false);
  const [showHealthSuggestions, setShowHealthSuggestions] = useState(false);
  const [showSafetySuggestions, setShowSafetySuggestions] = useState(false);
  const [showPolicySuggestions, setShowPolicySuggestions] = useState(false);
  const [highlightedAmenityIndex, setHighlightedAmenityIndex] = useState(-1);
  const [highlightedBasicIndex, setHighlightedBasicIndex] = useState(-1);
  const [highlightedRoomIndex, setHighlightedRoomIndex] = useState(-1);
  const [highlightedHealthIndex, setHighlightedHealthIndex] = useState(-1);
  const [highlightedSafetyIndex, setHighlightedSafetyIndex] = useState(-1);
  const [highlightedPolicyIndex, setHighlightedPolicyIndex] = useState(-1);
  const [activeSubAmenityTab, setActiveSubAmenityTab] = useState("basic");
  const [geocoding, setGeocoding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const popularAmenities = [
    "WiFi", "Free WiFi", "AC", "Air Conditioning", "Parking", "Free Parking",
    "Swimming Pool", "Pool", "Gym", "Fitness Center", "Restaurant",
    "Free Breakfast", "Spa", "Laundry", "Room Service", "Airport Shuttle",
    "24 Hour Front Desk", "Elevator", "Non Smoking Rooms", "Family Rooms", "Room Service", "Lounge(Private,Shared)", "Refrigerator", 
  ];

  const popularPolicies = [
    "Free Cancellation", "No Smoking", "Pets Allowed", "Children Free",
    "Extra Bed Available", "Accessible Rooms", "Non Refundable", 
    "Full Refund Before 48h", "Strict Policy", "Flexible Policy",
    "Breakfast Included", "Children Policy", "ID Required", "Credit Card Required",
    "Minimum Stay 2 Nights", "No Pets", "Quiet Hours", "No Parties", "Passport, Aadhaar and Driving License are accepted as ID proof(s)", "Primary Guest should be atleast 18 years of age", "There are no restrictions on alcohol consumption.", "There are restrictions on alcohol consumption.", "1 infant (0-2 yrs) per room included without counting in total room capacity"
  ];

  const popularBasicFacilities = [
    "Free WiFi", "Parking", "Free Parking", "24 Hour Front Desk", "Elevator",
    "Restaurant", "Free Breakfast", "Laundry", "Airport Shuttle",
    "Non Smoking Rooms", "Family Rooms", "Lounge", "Refrigerator in Lobby",
    "Business Center", "Meeting Rooms", "Concierge", "Currency Exchange",
    "ATM", "Baggage Storage", "Newspapers", "Vending Machine"
  ];

  const popularRoomAmenities = [
    "Air Conditioning", "Private Bathroom", "King Bed", "Queen Bed",
    "Minibar", "Room Service", "Balcony", "City View", "Mountain View",
    "Flat Screen TV", "Cable TV", "Telephone", "Safe", "Desk", "Ironing Facilities",
    "Hair Dryer", "Bathrobe", "Slippers", "Coffee Maker", "Electric Kettle", "Wardrobe"
  ];

  const popularHealthWellness = [
    "Swimming Pool", "Gym", "Fitness Center", "Spa", "Sauna",
    "Steam Room", "Massage", "Hot Tub", "Yoga Classes", "Jogging Track",
    "Outdoor Pool", "Indoor Pool", "Poolside Bar", "Sun Deck", "Wellness Center",
    "Beauty Salon", "Ayurveda", "Meditation", "Personal Trainer", "Steam Bath"
  ];

  const popularSafetySecurity = [
    "CCTV", "Security Guard", "Fire Extinguisher", "Smoke Detector",
    "First Aid Kit", "Doctor on Call", "24 Hour Security", "Safe Deposit Box",
    "Electronic Key Card", "Panic Button", "Burglar Alarm", "Motion Sensors",
    "CCTV in Common Areas", "Fire Alarms", "Sprinkler System", "Emergency Exit",
    "Earthquake Resistant", "Power Backup", "Water Purifier", "Sanitized Rooms"
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

  const handlePoliciesInput = (e) => {
    setNewPolicy(e.target.value);
    setHighlightedPolicyIndex(-1);
    setShowPolicySuggestions(e.target.value.length > 0);
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

  // Basic Facilities handlers
  const handleBasicInput = (e) => {
    setNewBasicFacility(e.target.value);
    setHighlightedBasicIndex(-1);
    setShowBasicSuggestions(e.target.value.length > 0);
  };

  const handleBasicKeyDown = (e) => {
    const filteredSuggestions = popularBasicFacilities
      .filter((suggestion) =>
        suggestion.toLowerCase().includes(newBasicFacility.toLowerCase())
      )
      .slice(0, 8);
    const suggestionCount = filteredSuggestions.length;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedBasicIndex((prev) => 
        prev < suggestionCount - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedBasicIndex((prev) => 
        prev <= 0 ? suggestionCount - 1 : prev - 1
      );
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (highlightedBasicIndex >= 0 && highlightedBasicIndex < suggestionCount) {
        addBasicFacility(filteredSuggestions[highlightedBasicIndex]);
      } else {
        addBasicFacility(newBasicFacility);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setShowBasicSuggestions(false);
      setHighlightedBasicIndex(-1);
    }
  };

  const addBasicFacility = (facility) => {
    const trimmed = facility.trim();
    if (!trimmed || formData.basicFacilities.length >= 20 || formData.basicFacilities.some(f => f.toLowerCase() === trimmed.toLowerCase())) {
      toast.warning("Invalid or duplicate basic facility, or max 20 reached.");
      return;
    }
    setFormData(prev => ({ ...prev, basicFacilities: [...prev.basicFacilities, trimmed] }));
    setNewBasicFacility("");
    setShowBasicSuggestions(false);
    setHighlightedBasicIndex(-1);
    toast.success("Basic facility added!");
  };

  const removeBasicFacility = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      basicFacilities: prev.basicFacilities.filter((_, index) => index !== indexToRemove)
    }));
  };

  // Room Amenities handlers
  const handleRoomInput = (e) => {
    setNewRoomAmenity(e.target.value);
    setHighlightedRoomIndex(-1);
    setShowRoomSuggestions(e.target.value.length > 0);
  };

  const handleRoomKeyDown = (e) => {
    const filteredSuggestions = popularRoomAmenities
      .filter((suggestion) =>
        suggestion.toLowerCase().includes(newRoomAmenity.toLowerCase())
      )
      .slice(0, 8);
    const suggestionCount = filteredSuggestions.length;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedRoomIndex((prev) => 
        prev < suggestionCount - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedRoomIndex((prev) => 
        prev <= 0 ? suggestionCount - 1 : prev - 1
      );
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (highlightedRoomIndex >= 0 && highlightedRoomIndex < suggestionCount) {
        addRoomAmenity(filteredSuggestions[highlightedRoomIndex]);
      } else {
        addRoomAmenity(newRoomAmenity);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setShowRoomSuggestions(false);
      setHighlightedRoomIndex(-1);
    }
  };

  const addRoomAmenity = (amenity) => {
    const trimmed = amenity.trim();
    if (!trimmed || formData.roomAmenities.length >= 20 || formData.roomAmenities.some(r => r.toLowerCase() === trimmed.toLowerCase())) {
      toast.warning("Invalid or duplicate room amenity, or max 20 reached.");
      return;
    }
    setFormData(prev => ({ ...prev, roomAmenities: [...prev.roomAmenities, trimmed] }));
    setNewRoomAmenity("");
    setShowRoomSuggestions(false);
    setHighlightedRoomIndex(-1);
    toast.success("Room amenity added!");
  };

  const removeRoomAmenity = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      roomAmenities: prev.roomAmenities.filter((_, index) => index !== indexToRemove)
    }));
  };

  // Health & Wellness handlers
  const handleHealthInput = (e) => {
    setNewHealthItem(e.target.value);
    setHighlightedHealthIndex(-1);
    setShowHealthSuggestions(e.target.value.length > 0);
  };

  const handleHealthKeyDown = (e) => {
    const filteredSuggestions = popularHealthWellness
      .filter((suggestion) =>
        suggestion.toLowerCase().includes(newHealthItem.toLowerCase())
      )
      .slice(0, 8);
    const suggestionCount = filteredSuggestions.length;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedHealthIndex((prev) => 
        prev < suggestionCount - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedHealthIndex((prev) => 
        prev <= 0 ? suggestionCount - 1 : prev - 1
      );
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (highlightedHealthIndex >= 0 && highlightedHealthIndex < suggestionCount) {
        addHealthItem(filteredSuggestions[highlightedHealthIndex]);
      } else {
        addHealthItem(newHealthItem);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setShowHealthSuggestions(false);
      setHighlightedHealthIndex(-1);
    }
  };

  const addHealthItem = (item) => {
    const trimmed = item.trim();
    if (!trimmed || formData.healthWellness.length >= 20 || formData.healthWellness.some(h => h.toLowerCase() === trimmed.toLowerCase())) {
      toast.warning("Invalid or duplicate health item, or max 20 reached.");
      return;
    }
    setFormData(prev => ({ ...prev, healthWellness: [...prev.healthWellness, trimmed] }));
    setNewHealthItem("");
    setShowHealthSuggestions(false);
    setHighlightedHealthIndex(-1);
    toast.success("Health & wellness item added!");
  };

  const removeHealthItem = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      healthWellness: prev.healthWellness.filter((_, index) => index !== indexToRemove)
    }));
  };

  // Safety & Security handlers
  const handleSafetyInput = (e) => {
    setNewSafetyItem(e.target.value);
    setHighlightedSafetyIndex(-1);
    setShowSafetySuggestions(e.target.value.length > 0);
  };

  const handleSafetyKeyDown = (e) => {
    const filteredSuggestions = popularSafetySecurity
      .filter((suggestion) =>
        suggestion.toLowerCase().includes(newSafetyItem.toLowerCase())
      )
      .slice(0, 8);
    const suggestionCount = filteredSuggestions.length;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedSafetyIndex((prev) => 
        prev < suggestionCount - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedSafetyIndex((prev) => 
        prev <= 0 ? suggestionCount - 1 : prev - 1
      );
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (highlightedSafetyIndex >= 0 && highlightedSafetyIndex < suggestionCount) {
        addSafetyItem(filteredSuggestions[highlightedSafetyIndex]);
      } else {
        addSafetyItem(newSafetyItem);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setShowSafetySuggestions(false);
      setHighlightedSafetyIndex(-1);
    }
  };

  const addSafetyItem = (item) => {
    const trimmed = item.trim();
    if (!trimmed || formData.safetySecurity.length >= 20 || formData.safetySecurity.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      toast.warning("Invalid or duplicate safety item, or max 20 reached.");
      return;
    }
    setFormData(prev => ({ ...prev, safetySecurity: [...prev.safetySecurity, trimmed] }));
    setNewSafetyItem("");
    setShowSafetySuggestions(false);
    setHighlightedSafetyIndex(-1);
    toast.success("Safety item added!");
  };

  const removeSafetyItem = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      safetySecurity: prev.safetySecurity.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + formData.images.length > 50) {
      toast.warning("Maximum 50 images allowed");
      return;
    }
    setFormData((prev) => ({ ...prev, images: [...prev.images, ...files] }));
    e.target.value = "";
  };

  const handleAddMoreImages = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + formData.images.length > 50) {
      toast.warning("Maximum 50 images allowed");
      return;
    }
    setFormData((prev) => ({ ...prev, images: [...prev.images, ...files] }));
    e.target.value = "";
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleGeocode = async () => {
    if (!formData.location) return;

    setGeocoding(true);
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(formData.location)}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();

      if (data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        setFormData(prev => ({ ...prev, lat: lat.toString(), lng: lng.toString() }));
        toast.success("Coordinates fetched successfully!");
      } else {
        toast.error("No results found for this location");
      }
    } catch (error) {
      toast.error("Geocoding failed");
      console.error(error);
    } finally {
      setGeocoding(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.description ||
      !formData.location ||
      !formData.pricePerNight
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    const submitData = new FormData();
    submitData.append("name", formData.name);
    submitData.append("description", formData.description);
    submitData.append("location", formData.location);
    if (formData.lat && formData.lng) {
      submitData.append("lat", formData.lat);
      submitData.append("lng", formData.lng);
    }
    submitData.append("pricePerNight", formData.pricePerNight);
    submitData.append("totalRooms", formData.totalRooms);
    if (formData.amenities.length > 0) {
      submitData.append("amenities", JSON.stringify(formData.amenities));
    }
    if (formData.basicFacilities.length > 0) {
      submitData.append("basicFacilities", JSON.stringify(formData.basicFacilities));
    }
    if (formData.roomAmenities.length > 0) {
      submitData.append("roomAmenities", JSON.stringify(formData.roomAmenities));
    }
    if (formData.healthWellness.length > 0) {
      submitData.append("healthWellness", JSON.stringify(formData.healthWellness));
    }
    if (formData.safetySecurity.length > 0) {
      submitData.append("safetySecurity", JSON.stringify(formData.safetySecurity));
    }
    if (formData.policies.length > 0) {
      submitData.append("policies", JSON.stringify(formData.policies));
    }
    formData.images?.forEach((image) => {
      submitData.append("images", image);
    });

    setSubmitting(true);
    try {
      await hotelAPI.create(submitData);
      toast.success("Hotel created successfully!");
      navigate("/client/my-hotels");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create hotel");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center p-8">
          <FaHotel className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Please Login
          </h2>
          <Link
            to="/login"
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <Link
                to="/client/my-hotels"
                className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaArrowLeft />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Add New Hotel
                </h1>
                <p className="text-gray-600 mt-1">
                  List your property on CityPortal
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-xl rounded-xl border border-gray-200 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Hotel Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg placeholder-gray-400"
                placeholder="Enter hotel name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-vertical"
                placeholder="Describe your hotel, amenities, location highlights..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Location *
                </label>
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <FaMapMarkerAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="City, State, Country"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleGeocode}
                    disabled={geocoding || !formData.location}
                    className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-lg transition-all"
                  >
                    {geocoding ? (
                      <FaSpinner className="animate-spin h-4 w-4" />
                    ) : (
                      'Get Coords'
                    )}
                  </button>
                </div>
{formData.lat && formData.lng && (
                  <p className="text-xs text-emerald-600 mt-1 ml-1">
                    📍 {parseFloat(formData.lat).toFixed(4)}, {parseFloat(formData.lng).toFixed(4)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Latitude
                </label>
                <input
                  type="number"
                  name="lat"
                  value={formData.lat}
                  onChange={handleInputChange}
                  step="any"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="21.1702"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Longitude
                </label>
                <input
                  type="number"
                  name="lng"
                  value={formData.lng}
                  onChange={handleInputChange}
                  step="any"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="72.8311"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Price per Night * (₹)
                </label>
                <div className="relative">
                  <FaDollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    name="pricePerNight"
                    value={formData.pricePerNight}
                    onChange={handleInputChange}
                    min="0"
                    step="100"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="500"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Total Rooms *
              </label>
              <input
                type="number"
                name="totalRooms"
                value={formData.totalRooms}
                onChange={handleInputChange}
                min="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Amenities (optional)
              </label>
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    value={newAmenity}
    onChange={handleAmenitiesInput}
                    onKeyDown={handleAmenityKeyDown}
                    placeholder="Type amenity and press Enter (e.g., WiFi)."
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
                  <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-xl">
                    {formData.amenities.map((amenity, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium"
                      >
                        {amenity}
                        <button
                          type="button"
                          onClick={() => removeAmenity(index)}
                          className="ml-2 text-emerald-600 hover:text-emerald-800 p-0.5 rounded-full hover:bg-emerald-200 transition-colors"
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

            {/* Sub-Amenities Tabbed Section */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Sub-Amenities (optional)
              </label>
              <div className="mb-4">
                <div className="flex border-b border-gray-200">
                  <button
                    type="button"
                    onClick={() => setActiveSubAmenityTab("basic")}
                    className={`px-4 py-2 font-medium text-sm -mb-px ${
                      activeSubAmenityTab === "basic"
                        ? "text-emerald-600 border-b-2 border-emerald-600"
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
                        ? "text-emerald-600 border-b-2 border-emerald-600"
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
                        ? "text-emerald-600 border-b-2 border-emerald-600"
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
                        ? "text-emerald-600 border-b-2 border-emerald-600"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    Safety & Security
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              {activeSubAmenityTab === "basic" && (
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={newBasicFacility}
                      onChange={handleBasicInput}
                      onKeyDown={handleBasicKeyDown}
                      placeholder="Type basic facility (e.g., Free WiFi)"
                      className="w-full px-4 py-3 pr-24 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => addBasicFacility(newBasicFacility)}
                      disabled={!newBasicFacility.trim()}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Add
                    </button>
                  </div>

                  {showBasicSuggestions && (
                    <div className="border border-gray-200 rounded-xl bg-white shadow-sm max-h-48 overflow-y-auto">
                      {popularBasicFacilities
                        .filter((suggestion) =>
                          suggestion.toLowerCase().includes(newBasicFacility.toLowerCase())
                        )
                        .slice(0, 8)
                        .map((suggestion, index) => (
                          <button
                            key={suggestion}
                            type="button"
                            onClick={() => {
                              addBasicFacility(suggestion);
                              setHighlightedBasicIndex(-1);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm transition-colors border-b border-gray-100 last:border-b-0 ${
                              index === highlightedBasicIndex
                                ? 'bg-emerald-100 border-l-4 border-emerald-500 text-emerald-800 font-semibold'
                                : 'hover:bg-emerald-50 hover:text-emerald-700'
                            }`}
                          >
                            {suggestion}
                          </button>
                        ))}
                    </div>
                  )}

                  {formData.basicFacilities.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-3 bg-indigo-50 rounded-xl">
                      {formData.basicFacilities.map((facility, index) => (
                        <div
                          key={index}
                          className="inline-flex items-center px-3 py-1.5 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium"
                        >
                          {facility}
                          <button
                            type="button"
                            onClick={() => removeBasicFacility(index)}
                            className="ml-2 text-indigo-600 hover:text-indigo-800 p-0.5 rounded-full hover:bg-indigo-200 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <span className="text-xs text-gray-500 ml-2">
                        ({formData.basicFacilities.length}/20)
                      </span>
                    </div>
                  )}
                </div>
              )}

              {activeSubAmenityTab === "room" && (
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={newRoomAmenity}
                      onChange={handleRoomInput}
                      onKeyDown={handleRoomKeyDown}
                      placeholder="Type room amenity (e.g., Air Conditioning)"
                      className="w-full px-4 py-3 pr-24 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => addRoomAmenity(newRoomAmenity)}
                      disabled={!newRoomAmenity.trim()}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Add
                    </button>
                  </div>

                  {showRoomSuggestions && (
                    <div className="border border-gray-200 rounded-xl bg-white shadow-sm max-h-48 overflow-y-auto">
                      {popularRoomAmenities
                        .filter((suggestion) =>
                          suggestion.toLowerCase().includes(newRoomAmenity.toLowerCase())
                        )
                        .slice(0, 8)
                        .map((suggestion, index) => (
                          <button
                            key={suggestion}
                            type="button"
                            onClick={() => {
                              addRoomAmenity(suggestion);
                              setHighlightedRoomIndex(-1);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm transition-colors border-b border-gray-100 last:border-b-0 ${
                              index === highlightedRoomIndex
                                ? 'bg-emerald-100 border-l-4 border-emerald-500 text-emerald-800 font-semibold'
                                : 'hover:bg-emerald-50 hover:text-emerald-700'
                            }`}
                          >
                            {suggestion}
                          </button>
                        ))}
                    </div>
                  )}

                  {formData.roomAmenities.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-3 bg-purple-50 rounded-xl">
                      {formData.roomAmenities.map((amenity, index) => (
                        <div
                          key={index}
                          className="inline-flex items-center px-3 py-1.5 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                        >
                          {amenity}
                          <button
                            type="button"
                            onClick={() => removeRoomAmenity(index)}
                            className="ml-2 text-purple-600 hover:text-purple-800 p-0.5 rounded-full hover:bg-purple-200 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <span className="text-xs text-gray-500 ml-2">
                        ({formData.roomAmenities.length}/20)
                      </span>
                    </div>
                  )}
                </div>
              )}

              {activeSubAmenityTab === "health" && (
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={newHealthItem}
                      onChange={handleHealthInput}
                      onKeyDown={handleHealthKeyDown}
                      placeholder="Type health item (e.g., Swimming Pool)"
                      className="w-full px-4 py-3 pr-24 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => addHealthItem(newHealthItem)}
                      disabled={!newHealthItem.trim()}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Add
                    </button>
                  </div>

                  {showHealthSuggestions && (
                    <div className="border border-gray-200 rounded-xl bg-white shadow-sm max-h-48 overflow-y-auto">
                      {popularHealthWellness
                        .filter((suggestion) =>
                          suggestion.toLowerCase().includes(newHealthItem.toLowerCase())
                        )
                        .slice(0, 8)
                        .map((suggestion, index) => (
                          <button
                            key={suggestion}
                            type="button"
                            onClick={() => {
                              addHealthItem(suggestion);
                              setHighlightedHealthIndex(-1);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm transition-colors border-b border-gray-100 last:border-b-0 ${
                              index === highlightedHealthIndex
                                ? 'bg-emerald-100 border-l-4 border-emerald-500 text-emerald-800 font-semibold'
                                : 'hover:bg-emerald-50 hover:text-emerald-700'
                            }`}
                          >
                            {suggestion}
                          </button>
                        ))}
                    </div>
                  )}

                  {formData.healthWellness.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-3 bg-green-50 rounded-xl">
                      {formData.healthWellness.map((item, index) => (
                        <div
                          key={index}
                          className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                        >
                          {item}
                          <button
                            type="button"
                            onClick={() => removeHealthItem(index)}
                            className="ml-2 text-green-600 hover:text-green-800 p-0.5 rounded-full hover:bg-green-200 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <span className="text-xs text-gray-500 ml-2">
                        ({formData.healthWellness.length}/20)
                      </span>
                    </div>
                  )}
                </div>
              )}

              {activeSubAmenityTab === "safety" && (
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={newSafetyItem}
                      onChange={handleSafetyInput}
                      onKeyDown={handleSafetyKeyDown}
                      placeholder="Type safety feature (e.g., CCTV)"
                      className="w-full px-4 py-3 pr-24 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => addSafetyItem(newSafetyItem)}
                      disabled={!newSafetyItem.trim()}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Add
                    </button>
                  </div>

                  {showSafetySuggestions && (
                    <div className="border border-gray-200 rounded-xl bg-white shadow-sm max-h-48 overflow-y-auto">
                      {popularSafetySecurity
                        .filter((suggestion) =>
                          suggestion.toLowerCase().includes(newSafetyItem.toLowerCase())
                        )
                        .slice(0, 8)
                        .map((suggestion, index) => (
                          <button
                            key={suggestion}
                            type="button"
                            onClick={() => {
                              addSafetyItem(suggestion);
                              setHighlightedSafetyIndex(-1);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm transition-colors border-b border-gray-100 last:border-b-0 ${
                              index === highlightedSafetyIndex
                                ? 'bg-emerald-100 border-l-4 border-emerald-500 text-emerald-800 font-semibold'
                                : 'hover:bg-emerald-50 hover:text-emerald-700'
                            }`}
                          >
                            {suggestion}
                          </button>
                        ))}
                    </div>
                  )}

                  {formData.safetySecurity.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-3 bg-red-50 rounded-xl">
                      {formData.safetySecurity.map((item, index) => (
                        <div
                          key={index}
                          className="inline-flex items-center px-3 py-1.5 bg-red-100 text-red-800 rounded-full text-sm font-medium"
                        >
                          {item}
                          <button
                            type="button"
                            onClick={() => removeSafetyItem(index)}
                            className="ml-2 text-red-600 hover:text-red-800 p-0.5 rounded-full hover:bg-red-200 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <span className="text-xs text-gray-500 ml-2">
                        ({formData.safetySecurity.length}/20)
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Policies (optional)
              </label>
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    value={newPolicy}
                    onChange={handlePoliciesInput}
                    onKeyDown={(e) => {
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
                    }}
                    placeholder="Type policy and press Enter (e.g., Free Cancellation)."
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
                  <div className="flex flex-wrap gap-2 p-3 bg-blue-50 rounded-xl">
                    {formData.policies.map((policy, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                      >
                        {policy}
                        <button
                          type="button"
                          onClick={() => removePolicy(index)}
                          className="ml-2 text-blue-600 hover:text-blue-800 p-0.5 rounded-full hover:bg-blue-200 transition-colors"
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

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <FaImage className="mr-2 text-gray-400" />
                Hotel Images
              </label>
              <input
                type="file"
                name="images"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
              />
              <p className="mt-1 text-sm text-gray-500">
                Upload up to 50 high-quality images of your hotel (max 5MB each)
              </p>
            </div>

            {formData.images.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-gray-900">
                    Selected Images ({formData.images.length}/50)
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
                  {formData.images.slice(0, 3).map((image, index) => (
                    <div
                      key={index}
                      className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden relative bg-gray-100 group hover:shadow-md transition-shadow"
                    >
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-all z-10"
                        title="Remove image"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {formData.images.length > 3 && (
                    <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 font-medium text-sm shadow-sm border">
                      +{formData.images.length - 3}
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

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-emerald-600 text-white py-4 px-6 rounded-xl hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-500 font-semibold text-lg shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <FaSpinner className="h-5 w-5 animate-spin mr-2" />
                    Creating Hotel...
                  </>
                ) : (
                  "List My Hotel"
                )}
              </button>
              <Link
                to="/client/my-hotels"
                className="flex-1 sm:flex-none bg-gray-200 text-gray-900 py-4 px-6 rounded-xl hover:bg-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-500 font-semibold text-lg text-center shadow-sm transition-all duration-200"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>

        <div className="mt-8 bg-white shadow-sm rounded-lg border border-gray-200 p-6 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 p-2 flex items-center justify-center">
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user?.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <FaUser className="h-8 w-8 text-gray-500" />
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {user?.name || "Client"}
                </p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>
            <Link
              to="/client/dashboard"
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddHotel;
