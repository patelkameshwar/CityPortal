import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import api, { hotelAPI, eventAPI } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { 
  FaArrowLeft, 
  FaCalendarAlt, 
  FaHotel, 
  FaMapMarkerAlt, 
  FaImage, 
  FaRupeeSign, 
  FaClock, 
  FaUsers, 
  FaUpload, 
  FaSpinner, 
  FaBed, 
  FaUtensils 
} from "react-icons/fa";
import { toast } from "react-toastify";
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const EditItems = () => {
  const { type, id } = useParams();
  const legacyId = useParams().id; 
  const itemId = id || legacyId;
  const itemType = type || 'event'; 
  const isHotel = itemType === 'hotel';
  
  const apiService = isHotel ? hotelAPI : eventAPI;
  const backPath = isHotel ? '/client/my-hotels' : '/client/my-events';
  const pageTitle = isHotel ? 'Edit Hotel' : 'Edit Event';
  const icon = isHotel ? FaHotel : FaCalendarAlt;
  const capacityLabel = isHotel ? 'Total Rooms' : 'Total Seats';
  const Icon = icon;

  const [formData, setFormData] = useState({
    // Common fields
    title: "",
    description: "",
    location: "",
    lat: "",
    lng: "",
    price: "",
    capacity: "",
    images: [],
    // Event specific
    eventType: "one-day",
    eventTime: "",
    eventDate: "",
    bookingFromDate: "",
    bookingToDate: "",
    // Hotel specific  
    amenities: [],
    policies: [],
    // Sub-amenities (hotels)
    basicFacilities: [],
    roomAmenities: [],
    healthWellness: [],
    safetySecurity: [],
    pricePerNight: "",
    totalRooms: "",
    name: "",
  });

const [newAmenity, setNewAmenity] = useState("");
  const [newPolicy, setNewPolicy] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // Sub-amenities states (hotels only)
  const [activeSubAmenityTab, setActiveSubAmenityTab] = useState("basic");
  const [newBasicFacility, setNewBasicFacility] = useState("");
  const [newRoomAmenity, setNewRoomAmenity] = useState("");
  const [newHealthItem, setNewHealthItem] = useState("");
  const [newSafetyItem, setNewSafetyItem] = useState("");
  const [showBasicSuggestions, setShowBasicSuggestions] = useState(false);
  const [showRoomSuggestions, setShowRoomSuggestions] = useState(false);
  const [showHealthSuggestions, setShowHealthSuggestions] = useState(false);
  const [showSafetySuggestions, setShowSafetySuggestions] = useState(false);
  const [highlightedBasicIndex, setHighlightedBasicIndex] = useState(-1);
  const [highlightedRoomIndex, setHighlightedRoomIndex] = useState(-1);
  const [highlightedHealthIndex, setHighlightedHealthIndex] = useState(-1);
  const [highlightedSafetyIndex, setHighlightedSafetyIndex] = useState(-1);

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
    "Minimum Stay 2 Nights", "No Pets", "Quiet Hours", "No Parties", "Passport, Aadhaar and Driving License are accepted as ID proof(s)", "Primary Guest should be atleast 18 years of age", "There are no restrictions on alcohol consumption.", "There are restrictions on alcohol consumption.", "1 infant (0-2 yrs) per room included without counting in total room capacity", "Unmarried couples are not allowed", "Pets are not allowed", "Allows private parties or events", 
  ];

  // Sub-amenities popular lists
  const popularBasicFacilities = [
    "WiFi", "Free WiFi", "Air Conditioning", "HouseKeeping", "Swimming Pool", "Parking", "Free Parking", "24 Hour Front Desk", "Elevator", "Laundry Service", "Power Backup", "Smoke Detector", 
    "Restaurant", "Free Breakfast", "Laundry", "Airport Shuttle",
    "Smoking Rooms", "Non Smoking Rooms", "Family Rooms", "Lounge", "Refrigerator",
    "Business Center", "Meeting Rooms", "Concierge", "Currency Exchange",
    "ATM", "Baggage Storage", "Newspapers", "Washing Machine", "Vending Machine"
  ];

  const popularRoomAmenities = [
    "Air Conditioning", "Private Bathroom", "King Bed", "Queen Bed", "Full-Length Mirror", "Mineral Water", "Sofa",
    "Minibar", "Room Service", "Balcony", "City View", "Mountain View",
    "Flat Screen TV", "Cable TV", "Telephone", "Safe", "Work Desk", "Ironing Facilities",
    "Hair Dryer", "Bathrobe", "Slippers", "Coffee Maker", "Electric Kettle", "Wardrobe"
  ];

  const popularHealthWellness = [
    "Gym", "Fitness Center", "Spa", "Sauna",
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
  
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToRemove, setImagesToRemove] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Dynamic field mapping
  const fieldMap = {
    hotel: {
      title: 'name',
      price: 'pricePerNight',
      capacity: 'totalRooms',
      extra: 'amenities'
    },
    event: {
      title: 'title', 
      price: 'price',
      capacity: 'totalSeats',
      extra: null
    }
  };

  const mapApiDataToForm = (apiData) => {
    const map = fieldMap[itemType];
    return {
      title: apiData[map.title] || "",
      description: apiData.description || "",
      location: apiData.location || "",
      lat: apiData.coordinates?.lat ? apiData.coordinates.lat.toString() : "",
      lng: apiData.coordinates?.lng ? apiData.coordinates.lng.toString() : "",
      price: apiData[map.price] || "",
      capacity: apiData[map.capacity] || "",
      amenities: Array.isArray(apiData.amenities) ? apiData.amenities : [],
      policies: Array.isArray(apiData.policies) ? apiData.policies : [],
      ...(isHotel && { 
        basicFacilities: Array.isArray(apiData.basicFacilities) ? apiData.basicFacilities : [],
        roomAmenities: Array.isArray(apiData.roomAmenities) ? apiData.roomAmenities : [],
        healthWellness: Array.isArray(apiData.healthWellness) ? apiData.healthWellness : [],
        safetySecurity: Array.isArray(apiData.safetySecurity) ? apiData.safetySecurity : [],
      }),
      ...(itemType === 'event' && {
        eventType: apiData.eventDate ? "one-day" : "multi-day",
        eventTime: apiData.eventTime || "",
        eventDate: formatDate(apiData.eventDate),
        bookingFromDate: formatDate(apiData.bookingFromDate),
        bookingToDate: formatDate(apiData.bookingToDate),
      }),
      images: apiData.images || [],
    };
  };

  const mapFormDataToApi = (formData) => {
    const map = fieldMap[itemType];
    const data = {
      [map.title]: formData.title,
      description: formData.description,
      location: formData.location,
      [map.price]: formData.price,
      [map.capacity]: formData.capacity,
      ...(isHotel && { 
        amenities: formData.amenities || [],
        policies: formData.policies || [],
        basicFacilities: formData.basicFacilities || [],
        roomAmenities: formData.roomAmenities || [],
        healthWellness: formData.healthWellness || [],
        safetySecurity: formData.safetySecurity || [],
      }),
      ...(itemType === 'event' && ({
        amenities: formData.amenities || [],
        policies: formData.policies || [],
        eventType: formData.eventType,
        eventTime: formData.eventTime,
        ...(formData.eventType === 'one-day' 
          ? { eventDate: formData.eventDate }
          : { bookingFromDate: formData.bookingFromDate, bookingToDate: formData.bookingToDate }
        )
      })),
    };
    return data;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
  };

  // Fetch existing item data
  useEffect(() => {
    if (!itemId) {
      toast.error("No item ID provided");
      navigate(backPath);
      return;
    }

    const fetchItem = async () => {
      try {
        const response = await apiService.getById(itemId);
        const apiItem = response.data.event || response.data.hotel || response.data; // Handle different wrappers
        const formData = mapApiDataToForm(apiItem);
        
        setFormData(formData);
        
        // Set existing images
        const safeImages = Array.isArray(apiItem.images) ? apiItem.images : [];
        setExistingImages(safeImages);
        setImagePreviews(safeImages);
      } catch (error) {
        console.error(`Failed to load ${itemType}:`, error);
        toast.error(`Failed to load ${isHotel ? 'hotel' : 'event'} data`);
        navigate(backPath);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [itemId, itemType, backPath, apiService]);

  const handleCommonChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'images') {
      handleImageUpload(files);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = (files) => {
    const newFiles = Array.from(files);
    setImageFiles(prev => [...prev, ...newFiles]);
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const handleEventTypeChange = (newType) => {
    setFormData(prev => ({ 
      ...prev, 
      eventType: newType,
      ...(newType === 'one-day' && formData.bookingFromDate && {
        bookingFromDate: formData.eventDate,
        bookingToDate: formData.eventDate
      })
    }));
  };

  const handleAmenitiesInput = (e) => {
    setNewAmenity(e.target.value);
    setHighlightedIndex(-1);
    setShowSuggestions(e.target.value.length > 0);
  };

  const handlePoliciesInput = (e) => {
    setNewPolicy(e.target.value);
    setHighlightedIndex(-1);
    setShowSuggestions(e.target.value.length > 0);
  };

  const addAmenity = (amenity) => {
    const trimmed = amenity.trim();
    if (!trimmed || formData.amenities.length >= 20 || formData.amenities.some(a => a.toLowerCase() === trimmed.toLowerCase())) {
      toast.warning("Invalid or duplicate amenity, or max 20 reached.");
      return;
    }
    setFormData(prev => ({ ...prev, amenities: [...prev.amenities, trimmed] }));
    setNewAmenity("");
    setShowSuggestions(false);
    setHighlightedIndex(-1);
    toast.success("Amenity added!");
  };

  const addPolicy = (policy) => {
    const trimmed = policy.trim();
    if (!trimmed || (formData.policies || []).length >= 15 || (formData.policies || []).some(p => p.toLowerCase() === trimmed.toLowerCase())) {
      toast.warning("Invalid or duplicate policy, or max 15 reached.");
      return;
    }
    setFormData(prev => ({ ...prev, policies: [...prev.policies, trimmed] }));
    setNewPolicy("");
    setShowSuggestions(false);
    setHighlightedIndex(-1);
    toast.success("Policy added!");
  };

  const removeAmenity = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter((_, index) => index !== indexToRemove)
    }));
  };

  const removePolicy = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      policies: (prev.policies || []).filter((_, index) => index !== indexToRemove)
    }));
  };

  // Sub-amenities handlers for hotels
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

  // Room amenities handlers
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

  const handleEventDateChange = (e) => {
    const date = e.target.value;
    setFormData(prev => ({
      ...prev,
      eventDate: date,
      ...(prev.eventType === 'one-day' && {
        bookingFromDate: date,
        bookingToDate: date
      })
    }));
  };

  const handleRemoveImage = (index, isExisting = false) => {
    if (isExisting) {
      const imageUrl = existingImages[index];
      const newSet = new Set(imagesToRemove);
      newSet.add(imageUrl);
      setImagesToRemove(newSet);
      // Update previews to remove it
      setImagePreviews(prev => prev.filter((_, i) => i !== index));
      toast.success('Image marked for removal');
    } else {
      const fileIndex = index;
      const preview = imagePreviews[existingImages.length + index];
      if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview);
      setImagePreviews(prev => prev.filter((_, i) => i < existingImages.length || i !== existingImages.length + index));
      setImageFiles(prev => prev.filter((_, i) => i !== fileIndex));
      toast.info('New image removed');
    }
  };

  const validateForm = () => {
    if (!formData.title.trim() || !formData.description.trim() || 
        !formData.location.trim() || !formData.price || !formData.capacity) {
      toast.error("Please fill all required fields");
      return false;
    }
    
    if (itemType === 'event') {
      if (formData.eventType === 'one-day' && !formData.eventDate) {
        toast.error("Please select event date");
        return false;
      }
      if (formData.eventType === 'multi-day') {
        const from = new Date(formData.bookingFromDate);
        const to = new Date(formData.bookingToDate);
        if (from > to) {
          toast.error("To date must be after from date");
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || saving) return;

    setSaving(true);
    try {
      const submitData = new FormData();
      const apiPayload = mapFormDataToApi(formData);
      
      // Append lat/lng directly
      if (formData.lat) submitData.append('lat', formData.lat);
      if (formData.lng) submitData.append('lng', formData.lng);
      
// Append other fields
      Object.entries(apiPayload).forEach(([key, value]) => {
        if (value !== undefined && value !== null && key !== 'coordinates') {
          if ((key === 'amenities' || key === 'policies' || key === 'basicFacilities' || key === 'roomAmenities' || key === 'healthWellness' || key === 'safetySecurity') && Array.isArray(value)) {
            submitData.append(key, JSON.stringify(value));
          } else {
            submitData.append(key, String(value));
          }
        }
      });

      // Append new images
      imageFiles.forEach(file => {
        submitData.append('images', file);
      });

      // Append images to remove
      if (imagesToRemove.size > 0) {
        submitData.append('imagesToRemove', Array.from(imagesToRemove).join(','));
      }

      await apiService.update(itemId, submitData);
      toast.success(`${isHotel ? 'Hotel' : 'Event'} updated successfully!`);
      navigate(backPath);
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to update ${itemType}`);
    } finally {
      setSaving(false);
    }
  };

  // Sync booking dates for one-day events
  useEffect(() => {
    if (formData.eventType === 'one-day' && formData.eventDate) {
      setFormData(prev => ({
        ...prev,
        bookingFromDate: formData.eventDate,
        bookingToDate: formData.eventDate
      }));
    }
  }, [formData.eventType, formData.eventDate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <FaSpinner className="h-12 w-12 animate-spin text-emerald-600" />
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
              Back to {isHotel ? 'My Hotels' : 'My Events'}
            </Link>
            <div className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-100">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-emerald-100 border-2 border-emerald-200">
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-emerald-500 flex items-center justify-center text-white font-semibold text-xs">
                    {user?.name?.[0] || 'C'}
                  </div>
                )}
              </div>
              <span className="font-semibold text-gray-900 hidden sm:inline">{user?.name}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-200">
          <div className="px-8 py-8 border-b border-gray-200 bg-gradient-to-r from-emerald-50 via-blue-50 to-purple-50">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/80 rounded-2xl shadow-lg border">
                <Icon className="h-10 w-10 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                  {pageTitle}
                </h1>
                <p className="text-lg text-gray-600 mt-1">Update your {isHotel ? 'hotel' : 'event'} listing</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Basic Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <label className="block text-base font-semibold text-gray-800 mb-3">
                  {isHotel ? 'Hotel Name' : 'Event Title'} *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleCommonChange}
                  className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  placeholder={isHotel ? "Grand Palace Hotel" : "Summer Music Festival 2025"}
                  required
                />
              </div>

              <div>
                <label className="text-base font-semibold text-gray-800 mb-3 flex items-center">
                  <FaRupeeSign className="mr-2 text-emerald-600" />
                  Price {isHotel ? 'per Night' : 'per Seat'} *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleCommonChange}
                  min="0"
                  step="50"
                  className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  placeholder="1500"
                  required
                />
              </div>
            </div>

            {/* Location & Capacity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="lg:col-span-2">
                <label className="text-base font-semibold text-gray-800 mb-3 flex items-center">
                  <FaMapMarkerAlt className="mr-2 text-blue-600" />
                  Location *
                </label>
                <div className="space-y-4">
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleCommonChange}
                    className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Downtown City Center, Main Street 123"
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                      <input
                        type="number"
                        name="lat"
                        value={formData.lat}
                        onChange={handleCommonChange}
                        step="any"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                        placeholder="21.1702"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                      <input
                        type="number"
                        name="lng"
                        value={formData.lng}
                        onChange={handleCommonChange}
                        step="any"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                        placeholder="72.8311"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-base font-semibold text-gray-800 mb-3 flex items-center">
                  <FaUsers className="mr-2 text-purple-600" />
                  {capacityLabel} *
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleCommonChange}
                  min="1"
                  className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="50"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-base font-semibold text-gray-800 mb-4">
                Description *
              </label>
              <textarea
                name="description"
                rows="5"
                value={formData.description}
                onChange={handleCommonChange}
                className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-500 focus:border-emerald-500 resize-vertical leading-relaxed"
                placeholder="Tell your guests about your hotel/event..."
                required
              />
            </div>

            {/* Type-specific sections */}
            {itemType === 'event' && (
              <>
                {/* Event Type Selector */}
                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-4">
                    Event Duration *
                  </label>
                  <div className="flex bg-gradient-to-r from-gray-100 to-gray-200 p-1 rounded-2xl shadow-inner">
                    <button
                      type="button"
                      onClick={() => handleEventTypeChange('one-day')}
                      className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all shadow-sm ${
                        formData.eventType === 'one-day'
                          ? 'bg-white border-2 border-emerald-500 text-emerald-700 shadow-md lift'
                          : 'text-gray-700 hover:text-gray-900 hover:bg-white'
                      }`}
                    >
                      One Day Event
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEventTypeChange('multi-day')}
                      className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all shadow-sm ${
                        formData.eventType === 'multi-day'
                          ? 'bg-white border-2 border-purple-500 text-purple-700 shadow-md lift'
                          : 'text-gray-700 hover:text-gray-900 hover:bg-white'
                      }`}
                    >
                      Multi-Day Event
                    </button>
                  </div>
                </div>

                {/* Event Dates/Time */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {formData.eventType === 'one-day' ? (
                    <div>
                      <label className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        <FaCalendarAlt className="mr-2 text-orange-500" />
                        Event Date *
                      </label>
                      <input
                        type="date"
                        name="eventDate"
                        value={formData.eventDate}
                        onChange={handleEventDateChange}
                        className="w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-500 focus:border-orange-500"
                        required
                      />
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-lg font-semibold text-gray-800 mb-3">
                          Booking From *
                        </label>
                        <input
                          type="date"
                          name="bookingFromDate"
                          value={formData.bookingFromDate}
                          onChange={handleCommonChange}
                          className="w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-lg font-semibold text-gray-800 mb-3">
                          Booking To *
                        </label>
                        <input
                          type="date"
                          name="bookingToDate"
                          value={formData.bookingToDate}
                          onChange={handleCommonChange}
                          min={formData.bookingFromDate}
                          className="w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-purple-500 focus:border-purple-500"
                          required
                        />
                      </div>
                    </>
                  )}
                  <div>
                    <label className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                      <FaClock className="mr-2 text-indigo-500" />
                      Event Time *
                    </label>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <TimePicker
                        ampm
                        views={['hours', 'minutes']}
                        value={formData.eventTime ? dayjs(`1970-01-01 ${formData.eventTime}`) : null}
                        onChange={(newValue) => {
                          const timeStr = newValue ? newValue.format('h:mm A') : '';
                          setFormData(prev => ({ ...prev, eventTime: timeStr }));
                        }}
                        slotProps={{
                          textField: {
                            className: "w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-2xl shadow-sm focus-within:outline-none focus-within:ring-4 focus-within:ring-indigo-500 focus-within:border-indigo-500",
                          }
                        }}
                      />
                    </LocalizationProvider>
                  </div>
                </div>
              </>
            )}
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-4">
                    {itemType === 'event' ? 'Event Facilities (optional)' : 'Amenities (optional)'}
                  </label>
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={newAmenity}
                      onChange={handleAmenitiesInput}
                      onKeyDown={(e) => {
                        const filteredSuggestions = popularAmenities
                          .filter((suggestion) =>
                            suggestion.toLowerCase().includes(newAmenity.toLowerCase())
                          )
                          .slice(0, 8);
                        const suggestionCount = filteredSuggestions.length;

                        if (e.key === "ArrowDown") {
                          e.preventDefault();
                          setHighlightedIndex((prev) => 
                            prev < suggestionCount - 1 ? prev + 1 : 0
                          );
                        } else if (e.key === "ArrowUp") {
                          e.preventDefault();
                          setHighlightedIndex((prev) => 
                            prev <= 0 ? suggestionCount - 1 : prev - 1
                          );
                        } else if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          if (highlightedIndex >= 0 && highlightedIndex < suggestionCount) {
                            addAmenity(filteredSuggestions[highlightedIndex]);
                          } else {
                            addAmenity(newAmenity);
                          }
                        } else if (e.key === "Escape") {
                          e.preventDefault();
                          setShowSuggestions(false);
                          setHighlightedIndex(-1);
                        }
                      }}
                      placeholder="Type amenity and press Enter (e.g., WiFi). "
                      className="w-full px-5 py-4 pr-24 border-2 border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-500 focus:border-emerald-500 text-base"
                    />
                    <button
                      type="button"
                      onClick={() => addAmenity(newAmenity)}
                      disabled={!newAmenity.trim()}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 px-5 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all"
                    >
                      Add
                    </button>
                  </div>

{showSuggestions && (
                    <div className="border-2 border-gray-200 rounded-2xl bg-white shadow-lg max-h-48 overflow-y-auto">
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
                              setHighlightedIndex(-1);
                            }}
                            className={`w-full text-left px-5 py-3 text-base transition-all border-b border-gray-100 last:border-b-0 ${
                              index === highlightedIndex
                                ? 'bg-emerald-100 border-l-4 border-emerald-500 text-emerald-800 font-semibold shadow-md'
                                : 'hover:bg-emerald-50 hover:text-emerald-700'
                            }`}
                          >
                            {suggestion}
                          </button>
                        ))}
                    </div>
                  )}

                  {formData.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-4 bg-gray-50 border-2 border-gray-200 rounded-2xl">
                      {formData.amenities.map((amenity, index) => (
                        <div
                          key={index}
                          className="inline-flex items-center px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full text-base font-semibold shadow-sm"
                        >
                          {amenity}
                          <button
                            type="button"
                            onClick={() => removeAmenity(index)}
                            className="ml-2 text-emerald-600 hover:text-emerald-800 p-1 rounded-full hover:bg-emerald-200 transition-all"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <span className="text-sm text-gray-500 ml-3 self-center">
                        ({formData.amenities.length}/20)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Sub-Amenities Tabbed Section - only for hotels */}
              {isHotel && (
                <>
                  <div>
                    <label className="block text-base font-semibold text-gray-800 mb-4">
                      Sub-Amenities (optional)
                    </label>
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-3xl p-6 border-2 border-gray-200 shadow-xl">
                      {/* Tab Navigation */}
                      <div className="flex mb-6 border-b border-gray-200">
                        <button
                          type="button"
                          onClick={() => setActiveSubAmenityTab("basic")}
                          className={`pb-3 px-6 font-semibold text-sm ${activeSubAmenityTab === 'basic' 
                            ? 'text-indigo-600 border-b-2 border-indigo-600' 
                            : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Basic Facilities
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveSubAmenityTab("room")}
                          className={`pb-3 px-6 font-semibold text-sm ${activeSubAmenityTab === 'room' 
                            ? 'text-purple-600 border-b-2 border-purple-600' 
                            : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Room Amenities
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveSubAmenityTab("health")}
                          className={`pb-3 px-6 font-semibold text-sm ${activeSubAmenityTab === 'health' 
                            ? 'text-green-600 border-b-2 border-green-600' 
                            : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Health & Wellness
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveSubAmenityTab("safety")}
                          className={`pb-3 px-6 font-semibold text-sm ${activeSubAmenityTab === 'safety' 
                            ? 'text-red-600 border-b-2 border-red-600' 
                            : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Safety & Security
                        </button>
                      </div>

                      {/* Tab Content */}
                      {activeSubAmenityTab === 'basic' && (
                        <div className="space-y-4">
                          <div className="relative">
                            <input
                              type="text"
                              value={newBasicFacility}
                              onChange={handleBasicInput}
                              onKeyDown={handleBasicKeyDown}
                              placeholder="Add basic facility (e.g., Free WiFi, Parking) and press Enter"
                              className="w-full px-5 py-4 pr-24 border-2 border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:border-indigo-500 text-base"
                            />
                            <button
                              type="button"
                              onClick={() => addBasicFacility(newBasicFacility)}
                              disabled={!newBasicFacility.trim()}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-5 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all"
                            >
                              Add
                            </button>
                          </div>

                          {showBasicSuggestions && (
                            <div className="border-2 border-gray-200 rounded-2xl bg-white shadow-lg max-h-48 overflow-y-auto">
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
                                    className={`w-full text-left px-5 py-3 text-base transition-all border-b border-gray-100 last:border-b-0 ${
                                      index === highlightedBasicIndex
                                        ? 'bg-indigo-100 border-l-4 border-indigo-500 text-indigo-800 font-semibold shadow-md'
                                        : 'hover:bg-indigo-50 hover:text-indigo-700'
                                    }`}
                                  >
                                    {suggestion}
                                  </button>
                                ))}
                            </div>
                          )}

                          {formData.basicFacilities.length > 0 && (
                            <div className="flex flex-wrap gap-2 p-4 bg-indigo-50 border-2 border-indigo-200 rounded-2xl">
                              {formData.basicFacilities.map((facility, index) => (
                                <div
                                  key={index}
                                  className="inline-flex items-center px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full text-base font-semibold shadow-sm"
                                >
                                  {facility}
                                  <button
                                    type="button"
                                    onClick={() => removeBasicFacility(index)}
                                    className="ml-2 text-indigo-600 hover:text-indigo-800 p-1 rounded-full hover:bg-indigo-200 transition-all"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                              <span className="text-sm text-gray-500 ml-3 self-center">
                                ({formData.basicFacilities.length}/20)
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {activeSubAmenityTab === 'room' && (
                        <div className="space-y-4">
                          <div className="relative">
                            <input
                              type="text"
                              value={newRoomAmenity}
                              onChange={handleRoomInput}
                              onKeyDown={handleRoomKeyDown}
                              placeholder="Add room amenity (e.g., Air Conditioning, Minibar) and press Enter"
                              className="w-full px-5 py-4 pr-24 border-2 border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-purple-500 focus:border-purple-500 text-base"
                            />
                            <button
                              type="button"
                              onClick={() => addRoomAmenity(newRoomAmenity)}
                              disabled={!newRoomAmenity.trim()}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-5 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all"
                            >
                              Add
                            </button>
                          </div>

                          {showRoomSuggestions && (
                            <div className="border-2 border-gray-200 rounded-2xl bg-white shadow-lg max-h-48 overflow-y-auto">
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
                                    className={`w-full text-left px-5 py-3 text-base transition-all border-b border-gray-100 last:border-b-0 ${
                                      index === highlightedRoomIndex
                                        ? 'bg-purple-100 border-l-4 border-purple-500 text-purple-800 font-semibold shadow-md'
                                        : 'hover:bg-purple-50 hover:text-purple-700'
                                    }`}
                                  >
                                    {suggestion}
                                  </button>
                                ))}
                            </div>
                          )}

                          {formData.roomAmenities.length > 0 && (
                            <div className="flex flex-wrap gap-2 p-4 bg-purple-50 border-2 border-purple-200 rounded-2xl">
                              {formData.roomAmenities.map((amenity, index) => (
                                <div
                                  key={index}
                                  className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-base font-semibold shadow-sm"
                                >
                                  {amenity}
                                  <button
                                    type="button"
                                    onClick={() => removeRoomAmenity(index)}
                                    className="ml-2 text-purple-600 hover:text-purple-800 p-1 rounded-full hover:bg-purple-200 transition-all"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                              <span className="text-sm text-gray-500 ml-3 self-center">
                                ({formData.roomAmenities.length}/20)
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {activeSubAmenityTab === 'health' && (
                        <div className="space-y-4">
                          <div className="relative">
                            <input
                              type="text"
                              value={newHealthItem}
                              onChange={handleHealthInput}
                              onKeyDown={handleHealthKeyDown}
                              placeholder="Add health item (e.g., Swimming Pool, Gym) and press Enter"
                              className="w-full px-5 py-4 pr-24 border-2 border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-green-500 focus:border-green-500 text-base"
                            />
                            <button
                              type="button"
                              onClick={() => addHealthItem(newHealthItem)}
                              disabled={!newHealthItem.trim()}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-5 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all"
                            >
                              Add
                            </button>
                          </div>

                          {showHealthSuggestions && (
                            <div className="border-2 border-gray-200 rounded-2xl bg-white shadow-lg max-h-48 overflow-y-auto">
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
                                    className={`w-full text-left px-5 py-3 text-base transition-all border-b border-gray-100 last:border-b-0 ${
                                      index === highlightedHealthIndex
                                        ? 'bg-green-100 border-l-4 border-green-500 text-green-800 font-semibold shadow-md'
                                        : 'hover:bg-green-50 hover:text-green-700'
                                    }`}
                                  >
                                    {suggestion}
                                  </button>
                                ))}
                            </div>
                          )}

                          {formData.healthWellness.length > 0 && (
                            <div className="flex flex-wrap gap-2 p-4 bg-green-50 border-2 border-green-200 rounded-2xl">
                              {formData.healthWellness.map((item, index) => (
                                <div
                                  key={index}
                                  className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-base font-semibold shadow-sm"
                                >
                                  {item}
                                  <button
                                    type="button"
                                    onClick={() => removeHealthItem(index)}
                                    className="ml-2 text-green-600 hover:text-green-800 p-1 rounded-full hover:bg-green-200 transition-all"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                              <span className="text-sm text-gray-500 ml-3 self-center">
                                ({formData.healthWellness.length}/20)
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {activeSubAmenityTab === 'safety' && (
                        <div className="space-y-4">
                          <div className="relative">
                            <input
                              type="text"
                              value={newSafetyItem}
                              onChange={handleSafetyInput}
                              onKeyDown={handleSafetyKeyDown}
                              placeholder="Add safety feature (e.g., CCTV, Security Guard) and press Enter"
                              className="w-full px-5 py-4 pr-24 border-2 border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-red-500 focus:border-red-500 text-base"
                            />
                            <button
                              type="button"
                              onClick={() => addSafetyItem(newSafetyItem)}
                              disabled={!newSafetyItem.trim()}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-5 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all"
                            >
                              Add
                            </button>
                          </div>

                          {showSafetySuggestions && (
                            <div className="border-2 border-gray-200 rounded-2xl bg-white shadow-lg max-h-48 overflow-y-auto">
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
                                    className={`w-full text-left px-5 py-3 text-base transition-all border-b border-gray-100 last:border-b-0 ${
                                      index === highlightedSafetyIndex
                                        ? 'bg-red-100 border-l-4 border-red-500 text-red-800 font-semibold shadow-md'
                                        : 'hover:bg-red-50 hover:text-red-700'
                                    }`}
                                  >
                                    {suggestion}
                                  </button>
                                ))}
                            </div>
                          )}

                          {formData.safetySecurity.length > 0 && (
                            <div className="flex flex-wrap gap-2 p-4 bg-red-50 border-2 border-red-200 rounded-2xl">
                              {formData.safetySecurity.map((item, index) => (
                                <div
                                  key={index}
                                  className="inline-flex items-center px-4 py-2 bg-red-100 text-red-800 rounded-full text-base font-semibold shadow-sm"
                                >
                                  {item}
                                  <button
                                    type="button"
                                    onClick={() => removeSafetyItem(index)}
                                    className="ml-2 text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-200 transition-all"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                              <span className="text-sm text-gray-500 ml-3 self-center">
                                ({formData.safetySecurity.length}/20)
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </>    
              )}

            {/* Policies Section */}
              <div>
                <label className="block text-base font-semibold text-gray-800 mb-4">
                  Policies & Rules (optional)
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
                          setHighlightedIndex((prev) => 
                            prev < suggestionCount - 1 ? prev + 1 : 0
                          );
                        } else if (e.key === "ArrowUp") {
                          e.preventDefault();
                          setHighlightedIndex((prev) => 
                            prev <= 0 ? suggestionCount - 1 : prev - 1
                          );
                        } else if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          if (highlightedIndex >= 0 && highlightedIndex < suggestionCount) {
                            addPolicy(filteredSuggestions[highlightedIndex]);
                          } else {
                            addPolicy(newPolicy);
                          }
                        } else if (e.key === "Escape") {
                          e.preventDefault();
                          setShowSuggestions(false);
                          setHighlightedIndex(-1);
                        }
                      }}
                      placeholder="Type policy and press Enter (e.g., Free Cancellation)"
                      className="w-full px-5 py-4 pr-24 border-2 border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-amber-500 focus:border-amber-500 text-base"
                    />
                    <button
                      type="button"
                      onClick={() => addPolicy(newPolicy)}
                      disabled={!newPolicy.trim()}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 px-5 py-3 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 focus:outline-none focus:ring-4 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all"
                    >
                      Add
                    </button>
                  </div>

                  {showSuggestions && (
                    <div className="border-2 border-gray-200 rounded-2xl bg-white shadow-lg max-h-48 overflow-y-auto">
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
                              setHighlightedIndex(-1);
                            }}
                            className={`w-full text-left px-5 py-3 text-base transition-all border-b border-gray-100 last:border-b-0 ${
                              index === highlightedIndex
                                ? 'bg-amber-100 border-l-4 border-amber-500 text-amber-800 font-semibold shadow-md'
                                : 'hover:bg-amber-50 hover:text-amber-700'
                            }`}
                          >
                            {suggestion}
                          </button>
                        ))}
                    </div>
                  )}

                  {(formData.policies || []).length > 0 && (
                    <div className="flex flex-wrap gap-2 p-4 bg-gray-50 border-2 border-gray-200 rounded-2xl">
                      {formData.policies.map((policy, index) => (
                        <div
                          key={index}
                          className="inline-flex items-center px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-base font-semibold shadow-sm"
                        >
                          {policy}
                          <button
                            type="button"
                            onClick={() => removePolicy(index)}
                            className="ml-2 text-amber-600 hover:text-amber-800 p-1 rounded-full hover:bg-amber-200 transition-all"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <span className="text-sm text-gray-500 ml-3 self-center">
                        ({(formData.policies || []).length}/15)
                      </span>
                    </div>
                  )}
                </div>
              </div>


            {/* Images Section */}
            <div>
              <label className="block text-base font-semibold text-gray-800 mb-5 flex items-center">
                <FaImage className="mr-3 h-7 w-7 text-blue-500" />
                {isHotel ? 'Hotel Images' : 'Event Images'}
              </label>
              
              {existingImages?.length > 0 && (
                <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200">
                  <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                  Current Images ({(existingImages?.length || 0) - imagesToRemove.size})
                    {imagesToRemove.size > 0 && (
                      <span className="ml-2 text-red-600 text-sm font-medium">({imagesToRemove.size} to remove)</span>
                    )}
                  </h4>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                    {(existingImages || []).filter(img => !imagesToRemove.has(img))
                      .slice(0, 10)
                      .map((imgSrc, idx) => {
                        const actualIdx = existingImages.indexOf(imgSrc);
                        return (
                          <div key={`existing-${imgSrc}`} className="group relative overflow-hidden rounded-2xl shadow-lg bg-gradient-to-br from-gray-50 to-gray-100 aspect-square hover:shadow-2xl transition-all">
                            <img src={imgSrc} alt={`Current ${actualIdx + 1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(actualIdx, true)}
                              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-2xl flex items-center justify-center text-lg font-bold shadow-2xl opacity-0 group-hover:opacity-100 transition-all z-20"
                              title="Remove this image"
                            >
                              ×
                            </button>
                          </div>
                        );
                      })}
                    {existingImages?.length > 10 && (
                      <div className="col-span-1 md:col-span-1 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center shadow-lg font-semibold text-gray-600">
                        +{Math.max(0, existingImages?.length - imagesToRemove.size - 10)}
                      </div>
                    )}
                  </div>
                  {imagesToRemove.size > 0 && (
                    <p className="text-sm text-red-700 mt-3 font-medium bg-red-50 p-3 rounded-xl">
                      {imagesToRemove.size} image(s) will be removed on save
                    </p>
                  )}
                  <p className="text-sm text-blue-700 mt-3 font-medium">
                    Add new images below
                  </p>
                </div>
              )}

              {/* Upload New Images */}
              <div className="border-4 border-dashed border-gray-300 rounded-3xl p-4 text-center hover:border-emerald-400 hover:bg-emerald-50 transition-all group cursor-pointer bg-gradient-to-b from-gray-50 to-white shadow-xl">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleCommonChange}
                  name="images"
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center space-y-4">
                  <FaUpload className="h-8 w-8 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                  <div>
                    <p className="text-lg font-bold text-gray-900 group-hover:text-emerald-700">
                      Click to upload new photos
                    </p>
                    <p className="text-base text-gray-600 mt-1">
                      PNG, JPG up to 10MB (recommended: high quality, well-lit)
                    </p>
                  </div>
                </label>
              </div>

              {/* New Image Previews */}
              {imagePreviews.length > ((existingImages || []).length) && (
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-base font-semibold text-gray-900">
                      New Images to Add ({imagePreviews.length - (existingImages?.length || 0)})
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {imagePreviews.slice(existingImages.length).map((preview, idx) => (
                      <div key={`new-${idx}`} className="group relative overflow-hidden rounded-2xl aspect-square bg-gradient-to-br from-emerald-50 to-emerald-100 shadow-lg hover:shadow-2xl transition-all">
                        <img src={preview} alt={`New ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx, false)}
                          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-2xl flex items-center justify-center text-lg font-bold shadow-2xl opacity-0 group-hover:opacity-100 transition-all z-20"
                          title="Remove"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-200 justify-center">
              <Link
                to={backPath}
                className=" sm:w-auto bg-gradient-to-r from-gray-200 to-gray-300 text-gray-900 py-5 px-8 rounded-2xl hover:from-gray-300 hover:to-gray-400 font-bold text-lg shadow-lg transition-all text-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className=" sm:w-auto bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-5 px-8 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
              >
                {saving ? (
                  <>
                    <FaSpinner className="h-5 w-5 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <span>Update {isHotel ? 'Hotel' : 'Event'}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditItems;

