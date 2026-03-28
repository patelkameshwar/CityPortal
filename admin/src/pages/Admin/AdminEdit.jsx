import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
import api from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  FaArrowLeft,
  FaUser,
  FaHotel,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaImage,
  FaRupeeSign,
  FaClock,
  FaUsers,
  FaUpload,
  FaSpinner,
  FaBed,
  FaUtensils,
  FaPhone,
  FaEnvelope,
  FaCamera,
  FaRupeeSign as RupeeIcon,
  FaUsers as UsersIcon,
  FaAlignLeft,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

const AdminEdit = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Existing states
  const [itemData, setItemData] = useState(null);
  const [formData, setFormData] = useState({
    lat: "",
    lng: "",
    // Add amenities/policies arrays
    amenities: [],
    policies: [],
    // Hotel sub-amenities
    basicFacilities: [],
    roomAmenities: [],
    healthWellness: [],
    safetySecurity: [],
  });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToRemove, setImagesToRemove] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [eventType, setEventType] = useState("one-day");

  // NEW: Amenities/policies states (Steps 2-3)
  const [newAmenity, setNewAmenity] = useState("");
  const [newPolicy, setNewPolicy] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // NEW: Hotel sub-amenities states
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

  // NEW: Popular lists (Step 3)
  const popularAmenities = [
    "WiFi",
    "Free WiFi",
    "AC",
    "Air Conditioning",
    "Parking",
    "Free Parking",
    "Swimming Pool",
    "Pool",
    "Gym",
    "Fitness Center",
    "Restaurant",
    "Free Breakfast",
    "Spa",
    "Laundry",
    "Room Service",
    "Airport Shuttle",
    "24 Hour Front Desk",
    "Elevator",
    "Non Smoking Rooms",
    "Family Rooms",
    "Room Service",
    "Lounge(Private,Shared)",
    "Refrigerator",
  ];

  const popularPolicies = [
    "Free Cancellation",
    "No Smoking",
    "Pets Allowed",
    "Children Free",
    "Extra Bed Available",
    "Accessible Rooms",
    "Non Refundable",
    "Full Refund Before 48h",
    "Strict Policy",
    "Flexible Policy",
    "Breakfast Included",
    "Children Policy",
    "ID Required",
    "Credit Card Required",
    "Minimum Stay 2 Nights",
    "No Pets",
    "Quiet Hours",
    "No Parties",
    "Passport, Aadhaar and Driving License are accepted as ID proof(s)",
    "Primary Guest should be atleast 18 years of age",
    "There are no restrictions on alcohol consumption.",
    "There are restrictions on alcohol consumption.",
    "1 infant (0-2 yrs) per room included without counting in total room capacity",
    "Unmarried couples are not allowed",
    "Pets are not allowed",
    "Allows private parties or events",
  ];

  // Sub-amenities popular lists (hotels only)
  const popularBasicFacilities = [
    "WiFi",
    "Free WiFi",
    "Air Conditioning",
    "HouseKeeping",
    "Swimming Pool",
    "Parking",
    "Free Parking",
    "24 Hour Front Desk",
    "Elevator",
    "Laundry Service",
    "Power Backup",
    "Smoke Detector",
    "Restaurant",
    "Free Breakfast",
    "Laundry",
    "Airport Shuttle",
    "Smoking Rooms",
    "Non Smoking Rooms",
    "Family Rooms",
    "Lounge",
    "Refrigerator",
    "Business Center",
    "Meeting Rooms",
    "Concierge",
    "Currency Exchange",
    "ATM",
    "Baggage Storage",
    "Newspapers",
    "Washing Machine",
    "Vending Machine",
  ];

  const popularRoomAmenities = [
    "Air Conditioning",
    "Private Bathroom",
    "King Bed",
    "Queen Bed",
    "Full-Length Mirror",
    "Mineral Water",
    "Sofa",
    "Minibar",
    "Room Service",
    "Balcony",
    "City View",
    "Mountain View",
    "Flat Screen TV",
    "Cable TV",
    "Telephone",
    "Safe",
    "Work Desk",
    "Ironing Facilities",
    "Hair Dryer",
    "Bathrobe",
    "Slippers",
    "Coffee Maker",
    "Electric Kettle",
    "Wardrobe",
  ];

  const popularHealthWellness = [
    "Gym",
    "Fitness Center",
    "Spa",
    "Sauna",
    "Steam Room",
    "Massage",
    "Hot Tub",
    "Yoga Classes",
    "Jogging Track",
    "Outdoor Pool",
    "Indoor Pool",
    "Poolside Bar",
    "Sun Deck",
    "Wellness Center",
    "Beauty Salon",
    "Ayurveda",
    "Meditation",
    "Personal Trainer",
    "Steam Bath",
  ];

  const popularSafetySecurity = [
    "CCTV",
    "Security Guard",
    "Fire Extinguisher",
    "Smoke Detector",
    "First Aid Kit",
    "Doctor on Call",
    "24 Hour Security",
    "Safe Deposit Box",
    "Electronic Key Card",
    "Panic Button",
    "Burglar Alarm",
    "Motion Sensors",
    "CCTV in Common Areas",
    "Fire Alarms",
    "Sprinkler System",
    "Emergency Exit",
    "Earthquake Resistant",
    "Power Backup",
    "Water Purifier",
    "Sanitized Rooms",
  ];

  const typeConfig = {
    client: {
      title: "Edit Client",
      icon: FaUser,
      apiPath: `/admin/clients/${id}`,
      backLabel: "Clients",
      fieldMap: {
        title: "name",
        email: "email",
        phone: "phone",
        address: "address",
      },
      hasImages: false,
      imageField: "profilePicture",
    },
    hotel: {
      title: "Edit Hotel",
      icon: FaHotel,
      apiPath: `/hotels/${id}`,
      backLabel: "Hotels",
      fieldMap: {
        title: "name",
        price: "pricePerNight",
        capacity: "totalRooms",
        extra: "amenities",
      },
      hasImages: true,
      imageField: "images",
    },
    event: {
      title: "Edit Event",
      icon: FaCalendarAlt,
      apiPath: `/events/${id}`,
      backLabel: "Events",
      fieldMap: {
        title: "title",
        price: "price",
        capacity: "totalSeats",
      },
      hasImages: true,
      imageField: "images",
    },
    tourism: {
      title: "Edit Tourism",
      icon: FaMapMarkerAlt,
      apiPath: `/tourism/${id}`,
      backLabel: "Tourism",
      fieldMap: {
        title: "name",
        price: "entryFee",
        capacity: "totalVisitors",
        openTime: "openTime",
        closeTime: "closeTime",
      },
      hasImages: true,
      imageField: "images",
    },
    blog: {
      title: "Edit Blog",
      icon: FaAlignLeft,
      apiPath: `/blogs/${id}`,
      backLabel: "Blogs",
      fieldMap: {
        title: "title",
        extra: "excerpt",
      },
      hasImages: false,
    },
    view: {
      title: "View Blog",
      icon: FaAlignLeft,
      apiPath: `/blogs/${id}`,
      backLabel: "Blogs",
      fieldMap: {
        title: "title",
      },
      hasImages: false,
    },
  };

  const config = typeConfig[type] || typeConfig.client;
  const isHotel = type === "hotel";

  const backPath =
    location.state?.from || (type ? `/admin/${type}s` : "/admin-dashboard");
  const backLabel =
    location.state?.fromLabel ||
    config.backLabel ||
    (type ? `${type.charAt(0).toUpperCase() + type.slice(1)}s` : "Dashboard");

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return timeStr;
    let [hours, minutes, period] = [
      parseInt(match[1]),
      parseInt(match[2]),
      match[3].toUpperCase(),
    ];
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  };

  // UPDATED: Enhanced data mapping (Step 6)
  const mapApiDataToForm = (apiData) => {
    const mapped = {
      title: apiData[config.fieldMap?.title] || "",
      ...(type === "blog" && {
        excerpt: apiData.excerpt || "",
        author: apiData.author || "",
        category: apiData.category || "",
        date: apiData.date
          ? new Date(apiData.date).toISOString().split("T")[0]
          : "",
      }),
      ...(type !== "client" && { description: apiData.description || "" }),
      ...(type !== "client" && { description: apiData.description || "" }),
      ...(type !== "client" && {
        location: apiData.location || "",
        lat: apiData.coordinates?.lat ? apiData.coordinates.lat.toString() : "",
        lng: apiData.coordinates?.lng ? apiData.coordinates.lng.toString() : "",
      }),
      ...(config.fieldMap?.price && {
        price: apiData[config.fieldMap.price] || "",
      }),
      ...(config.fieldMap?.capacity && {
        capacity: apiData[config.fieldMap.capacity] || "",
      }),
      ...(type === "event" && { artist: apiData.artist || "" }),
      // NEW: Amenities and policies arrays
      amenities: Array.isArray(apiData.amenities) ? apiData.amenities : [],
      policies: Array.isArray(apiData.policies) ? apiData.policies : [],
      // NEW: Hotel sub-amenities
      ...(type === "hotel" && {
        basicFacilities: Array.isArray(apiData.basicFacilities)
          ? apiData.basicFacilities
          : [],
        roomAmenities: Array.isArray(apiData.roomAmenities)
          ? apiData.roomAmenities
          : [],
        healthWellness: Array.isArray(apiData.healthWellness)
          ? apiData.healthWellness
          : [],
        safetySecurity: Array.isArray(apiData.safetySecurity)
          ? apiData.safetySecurity
          : [],
      }),
      ...(config.fieldMap?.email && { email: apiData.email || "" }),
      ...(config.fieldMap?.phone && { phone: apiData.phone || "" }),
      ...(type !== "client" &&
        config.fieldMap?.address && { address: apiData.address || "" }),
      ...(type === "event" && {
        eventType: apiData.eventDate ? "one-day" : "multi-day",
        eventTime: apiData.eventTime || "",
        eventDate: apiData.eventDate
          ? new Date(apiData.eventDate).toISOString().split("T")[0]
          : "",
        bookingFromDate: apiData.bookingFromDate
          ? new Date(apiData.bookingFromDate).toISOString().split("T")[0]
          : "",
        bookingToDate: apiData.bookingToDate
          ? new Date(apiData.bookingToDate).toISOString().split("T")[0]
          : "",
      }),
      ...(type === "tourism" && {
        openTime: apiData.openTime || "",
        closeTime: apiData.closeTime || "",
        openTime24hr: formatTime(apiData.openTime),
        closeTime24hr: formatTime(apiData.closeTime),
      }),
      images: apiData.images || [],
      profilePicture: apiData.profilePicture || "",
    };
    return mapped;
  };

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await api.get(config.apiPath);
        // Handle consistent {success, data} structure from controllers + type-specific wrappers
        let apiItem = response.data.data || response.data;
        apiItem = apiItem.event || apiItem.hotel || apiItem.tourism || apiItem.client || apiItem;
        
        const formDataMapped = mapApiDataToForm(apiItem);
        setFormData(formDataMapped);
        setEventType(formDataMapped.eventType || "one-day");

        if (apiItem.images?.length > 0) {
          setExistingImages(apiItem.images);
          setImagePreviews(apiItem.images);
        }
        if (apiItem.profilePicture) {
          setImagePreviews([apiItem.profilePicture]);
          setExistingImages([apiItem.profilePicture]);
        }
      } catch (error) {
        toast.error(`Failed to load ${type}`);
        navigate(backPath);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchItem();
  }, [type, id, config.apiPath, backPath, navigate]);

  // Input change handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCommonChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "images") {
      handleImageUpload(files);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // NEW: Amenities handlers
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
    if (
      !trimmed ||
      formData.amenities.length >= 20 ||
      formData.amenities.some((a) => a.toLowerCase() === trimmed.toLowerCase())
    ) {
      toast.warning("Invalid or duplicate amenity, or max 20 reached.");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      amenities: [...prev.amenities, trimmed],
    }));
    setNewAmenity("");
    setShowSuggestions(false);
    setHighlightedIndex(-1);
    toast.success("Amenity added!");
  };

  const addPolicy = (policy) => {
    const trimmed = policy.trim();
    if (
      !trimmed ||
      (formData.policies || []).length >= 15 ||
      (formData.policies || []).some(
        (p) => p.toLowerCase() === trimmed.toLowerCase(),
      )
    ) {
      toast.warning("Invalid or duplicate policy, or max 15 reached.");
      return;
    }
    setFormData((prev) => ({ ...prev, policies: [...prev.policies, trimmed] }));
    setNewPolicy("");
    setShowSuggestions(false);
    setHighlightedIndex(-1);
    toast.success("Policy added!");
  };

  const removeAmenity = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.filter((_, index) => index !== indexToRemove),
    }));
  };

  const removePolicy = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      policies: (prev.policies || []).filter(
        (_, index) => index !== indexToRemove,
      ),
    }));
  };

  // NEW: Amenities/policies keyboard handlers
  const handleAmenitiesKeyDown = (e) => {
    const filteredSuggestions = popularAmenities
      .filter((suggestion) =>
        suggestion.toLowerCase().includes(newAmenity.toLowerCase()),
      )
      .slice(0, 8);
    const suggestionCount = filteredSuggestions.length;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < suggestionCount - 1 ? prev + 1 : 0,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev <= 0 ? suggestionCount - 1 : prev - 1,
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
  };

  const handlePoliciesKeyDown = (e) => {
    const filteredSuggestions = popularPolicies
      .filter((suggestion) =>
        suggestion.toLowerCase().includes(newPolicy.toLowerCase()),
      )
      .slice(0, 8);
    const suggestionCount = filteredSuggestions.length;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < suggestionCount - 1 ? prev + 1 : 0,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev <= 0 ? suggestionCount - 1 : prev - 1,
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
  };

  // NEW: Hotel sub-amenity handlers
  const handleBasicInput = (e) => {
    setNewBasicFacility(e.target.value);
    setHighlightedBasicIndex(-1);
    setShowBasicSuggestions(e.target.value.length > 0);
  };

  const handleBasicKeyDown = (e) => {
    const filteredSuggestions = popularBasicFacilities
      .filter((suggestion) =>
        suggestion.toLowerCase().includes(newBasicFacility.toLowerCase()),
      )
      .slice(0, 8);
    const suggestionCount = filteredSuggestions.length;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedBasicIndex((prev) =>
        prev < suggestionCount - 1 ? prev + 1 : 0,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedBasicIndex((prev) =>
        prev <= 0 ? suggestionCount - 1 : prev - 1,
      );
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (
        highlightedBasicIndex >= 0 &&
        highlightedBasicIndex < suggestionCount
      ) {
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
    if (
      !trimmed ||
      formData.basicFacilities.length >= 20 ||
      formData.basicFacilities.some(
        (f) => f.toLowerCase() === trimmed.toLowerCase(),
      )
    ) {
      toast.warning("Invalid or duplicate basic facility, or max 20 reached.");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      basicFacilities: [...prev.basicFacilities, trimmed],
    }));
    setNewBasicFacility("");
    setShowBasicSuggestions(false);
    setHighlightedBasicIndex(-1);
    toast.success("Basic facility added!");
  };

  const removeBasicFacility = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      basicFacilities: prev.basicFacilities.filter(
        (_, index) => index !== indexToRemove,
      ),
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
        suggestion.toLowerCase().includes(newRoomAmenity.toLowerCase()),
      )
      .slice(0, 8);
    const suggestionCount = filteredSuggestions.length;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedRoomIndex((prev) =>
        prev < suggestionCount - 1 ? prev + 1 : 0,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedRoomIndex((prev) =>
        prev <= 0 ? suggestionCount - 1 : prev - 1,
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
    if (
      !trimmed ||
      formData.roomAmenities.length >= 20 ||
      formData.roomAmenities.some(
        (r) => r.toLowerCase() === trimmed.toLowerCase(),
      )
    ) {
      toast.warning("Invalid or duplicate room amenity, or max 20 reached.");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      roomAmenities: [...prev.roomAmenities, trimmed],
    }));
    setNewRoomAmenity("");
    setShowRoomSuggestions(false);
    setHighlightedRoomIndex(-1);
    toast.success("Room amenity added!");
  };

  const removeRoomAmenity = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      roomAmenities: prev.roomAmenities.filter(
        (_, index) => index !== indexToRemove,
      ),
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
        suggestion.toLowerCase().includes(newHealthItem.toLowerCase()),
      )
      .slice(0, 8);
    const suggestionCount = filteredSuggestions.length;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedHealthIndex((prev) =>
        prev < suggestionCount - 1 ? prev + 1 : 0,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedHealthIndex((prev) =>
        prev <= 0 ? suggestionCount - 1 : prev - 1,
      );
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (
        highlightedHealthIndex >= 0 &&
        highlightedHealthIndex < suggestionCount
      ) {
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
    if (
      !trimmed ||
      formData.healthWellness.length >= 20 ||
      formData.healthWellness.some(
        (h) => h.toLowerCase() === trimmed.toLowerCase(),
      )
    ) {
      toast.warning("Invalid or duplicate health item, or max 20 reached.");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      healthWellness: [...prev.healthWellness, trimmed],
    }));
    setNewHealthItem("");
    setShowHealthSuggestions(false);
    setHighlightedHealthIndex(-1);
    toast.success("Health & wellness item added!");
  };

  const removeHealthItem = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      healthWellness: prev.healthWellness.filter(
        (_, index) => index !== indexToRemove,
      ),
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
        suggestion.toLowerCase().includes(newSafetyItem.toLowerCase()),
      )
      .slice(0, 8);
    const suggestionCount = filteredSuggestions.length;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedSafetyIndex((prev) =>
        prev < suggestionCount - 1 ? prev + 1 : 0,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedSafetyIndex((prev) =>
        prev <= 0 ? suggestionCount - 1 : prev - 1,
      );
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (
        highlightedSafetyIndex >= 0 &&
        highlightedSafetyIndex < suggestionCount
      ) {
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
    if (
      !trimmed ||
      formData.safetySecurity.length >= 20 ||
      formData.safetySecurity.some(
        (s) => s.toLowerCase() === trimmed.toLowerCase(),
      )
    ) {
      toast.warning("Invalid or duplicate safety item, or max 20 reached.");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      safetySecurity: [...prev.safetySecurity, trimmed],
    }));
    setNewSafetyItem("");
    setShowSafetySuggestions(false);
    setHighlightedSafetyIndex(-1);
    toast.success("Safety item added!");
  };

  const removeSafetyItem = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      safetySecurity: prev.safetySecurity.filter(
        (_, index) => index !== indexToRemove,
      ),
    }));
  };

  const handleEventTypeChange = (newType) => {
    setEventType(newType);

    setFormData((prev) => ({
      ...prev,
      eventType: newType,

      ...(newType === "one-day"
        ? {
            eventDate: prev.eventDate || "",
            bookingFromDate: "",
            bookingToDate: "",
          }
        : {
            eventDate: "",
            bookingFromDate: prev.bookingFromDate || "",
            bookingToDate: prev.bookingToDate || "",
          }),
    }));
  };

  const handleImageUpload = (files) => {
    const newFiles = Array.from(files);
    setImageFiles((prev) => [...prev, ...newFiles]);
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveImage = (index, isExisting = false) => {
    if (isExisting) {
      const imageUrl = existingImages[index];
      const newSet = new Set(imagesToRemove);
      newSet.add(imageUrl);
      setImagesToRemove(newSet);
      setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    } else {
      setImageFiles((prev) => prev.filter((_, i) => i !== index));
      const preview = imagePreviews[existingImages.length + index];
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
      setImagePreviews((prev) =>
        prev.filter((_, i) => i !== existingImages.length + index),
      );
    }
  };

  const validateForm = () => {
    if (!formData.title?.trim()) {
      toast.error("Title is required");
      return false;
    }

    // Lat/Lng validation for location-based items
    if (type !== "client") {
      const latNum = parseFloat(formData.lat);
      const lngNum = parseFloat(formData.lng);
      if (formData.lat && (isNaN(latNum) || latNum < -90 || latNum > 90)) {
        toast.error("Latitude must be between -90 and 90");
        return false;
      }
      if (formData.lng && (isNaN(lngNum) || lngNum < -180 || lngNum > 180)) {
        toast.error("Longitude must be between -180 and 180");
        return false;
      }
    }

    return true;
  };

  // UPDATED: Enhanced handleSubmit for amenities/policies arrays (Step 10)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || saving) return;

    setSaving(true);
    try {
      const submitData = new FormData();

      // Append lat/lng for location-based items
      if (type !== "client") {
        if (formData.lat) submitData.append("lat", formData.lat);
        if (formData.lng) submitData.append("lng", formData.lng);
      }

      // NEW: Append amenities/policies as JSON arrays
      [
        "amenities",
        "policies",
        "basicFacilities",
        "roomAmenities",
        "healthWellness",
        "safetySecurity",
      ].forEach((key) => {
        if (Array.isArray(formData[key]) && formData[key].length > 0) {
          submitData.append(key, JSON.stringify(formData[key]));
        }
      });

      // Append other form fields (skip arrays handled above and images)
      Object.entries(formData).forEach(([key, value]) => {
        if (
          ![
            "images",
            "profilePicture",
            "eventDate",
            "bookingFromDate",
            "bookingToDate",
            "eventType",
            "lat",
            "lng",
            "amenities",
            "policies",
            "basicFacilities",
            "roomAmenities",
            "healthWellness",
            "safetySecurity",
          ].includes(key)
        ) {
          submitData.append(key, String(value || ""));
        }
      });

      // Type-specific field overrides
      if (type === "hotel") {
        submitData.set("name", formData.title || "");
        submitData.set("pricePerNight", formData.price || "");
        submitData.set("totalRooms", formData.capacity || "");
        submitData.set("location", formData.location || "");
        submitData.set("description", formData.description || "");
      }

      if (type === "tourism") {
        submitData.set("name", formData.title || "");
        submitData.set("entryFee", formData.price || "");
        submitData.set("totalVisitors", formData.capacity || "");
        submitData.set("location", formData.location || "");
        submitData.set("description", formData.description || "");
        submitData.set("openTime", formData.openTime || "");
        submitData.set("closeTime", formData.closeTime || "");
      }

      if (type === "event") {
        submitData.set("title", formData.title || "");
        submitData.set("price", formData.price || "");
        submitData.set("totalSeats", formData.capacity || "");
        submitData.set("eventType", eventType);
        submitData.set("location", formData.location || "");
        submitData.set("description", formData.description || "");
        if (eventType === "one-day") {
          submitData.set("eventDate", formData.eventDate || "");
        } else {
          submitData.set("bookingFromDate", formData.bookingFromDate || "");
          submitData.set("bookingToDate", formData.bookingToDate || "");
        }
      }

      if (imagesToRemove.size > 0) {
        submitData.append(
          "imagesToRemove",
          Array.from(imagesToRemove).join(","),
        );
      }

      imageFiles.forEach((file) => submitData.append("images", file));

      if (type === 'blog') {
        const blogData = {
          title: formData.title || "",
          excerpt: formData.excerpt || "",
          author: formData.author || "",
          category: formData.category || "",
          date: formData.date || undefined,
        };
        await api.put(config.apiPath, blogData);
      } else {
        await api.put(config.apiPath, submitData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      toast.success(
        `${config.title.replace(/^Edit /, "")} updated successfully!`,
      );
      navigate(backPath, {
        state: { from: location.pathname, fromLabel: config.title },
      });
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to update ${type}`);
    } finally {
      setSaving(false);
    }
  };

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
                    {user?.name?.[0]?.toUpperCase() || "A"}
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
                Update your {config.title.replace(/^Edit /, "")} listing
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <label className="block text-base font-semibold text-gray-800 mb-2">
                  {type === "hotel"
                    ? "Hotel Name"
                    : type === "event"
                      ? "Event Title"
                      : type === "tourism"
                        ? "Tourism Name"
                        : "Name"}{" "}
                  *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title || ""}
                  onChange={handleCommonChange}
                  className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  required
                />
              </div>

              {config.fieldMap?.price && (
                <div>
                  <label className="text-base font-semibold text-gray-800 mb-2 flex items-center">
                    <RupeeIcon className="mr-2 text-emerald-600" />
                    {type === "hotel"
                      ? "Price per Night"
                      : type === "event"
                        ? "Price per Seat"
                        : type === "tourism"
                          ? "Entry Fee"
                          : "Price"}{" "}
                    *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price || ""}
                    onChange={handleCommonChange}
                    min="0"
                    step="1"
                    className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    required
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {type === "event" && (
                <div>
                  <label className="text-base font-semibold text-gray-800 mb-2 flex items-center">
                    <FaUser className="mr-2 text-purple-600" />
                    Artist Name
                  </label>
                  <input
                    type="text"
                    name="artist"
                    value={formData.artist || ""}
                    onChange={handleCommonChange}
                    className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    placeholder="Main artist or performer name"
                  />
                </div>
              )}

              {config.fieldMap?.capacity && (
                <div>
                  <label className="text-base font-semibold text-gray-800 mb-2 flex items-center">
                    <UsersIcon className="mr-2 text-purple-600" />
                    {type === "hotel"
                      ? "Total Rooms"
                      : type === "event"
                        ? "Total Seats"
                        : type === "tourism"
                          ? "Total Visitors per day"
                          : "Capacity"}{" "}
                    *
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity || ""}
                    onChange={handleCommonChange}
                    min="1"
                    className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              )}

              {type !== "client" && type !== "blog" && (
                <div className="lg:col-span-2">
                  <label className="text-base font-semibold text-gray-800 mb-2 flex items-center">
                    <FaMapMarkerAlt className="mr-2 text-blue-600" />
                    Location *
                  </label>
                  <div className="space-y-4">
                    <input
                      type="text"
                      name="location"
                      value={formData.location || ""}
                      onChange={handleCommonChange}
                      className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Downtown City Center, Main Street 123"
                      required
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-base font-semibold text-gray-800 mb-2">
                          Latitude
                        </label>
                        <input
                          type="number"
                          name="lat"
                          value={formData.lat || ""}
                          onChange={handleCommonChange}
                          step="any"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                          placeholder="21.1702"
                        />
                      </div>
                      <div>
                        <label className="block text-base font-semibold text-gray-800 mb-2">
                          Longitude
                        </label>
                        <input
                          type="number"
                          name="lng"
                          value={formData.lng || ""}
                          onChange={handleCommonChange}
                          step="any"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                          placeholder="72.8311"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {type !== "client" && type !== "blog" && (
              <>
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows="5"
                    value={formData.description || ""}
                    onChange={handleCommonChange}
                    className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-500 focus:border-emerald-500 resize-vertical leading-relaxed"
                  />
                </div>
              </>
            )}
            {type === "blog" && (
              <div className="space-y-6">
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-2">
                    Excerpt *
                  </label>
                  <textarea
                    name="excerpt"
                    rows="3"
                    value={formData.excerpt || ""}
                    onChange={handleCommonChange}
                    className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-500 focus:border-emerald-500 resize-vertical leading-relaxed"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-base font-semibold text-gray-800 mb-2">
                      Author *
                    </label>
                    <input
                      type="text"
                      name="author"
                      value={formData.author || ""}
                      onChange={handleCommonChange}
                      className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-base font-semibold text-gray-800 mb-2">
                      Category *
                    </label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category || ""}
                      onChange={handleCommonChange}
                      className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date || ""}
                    onChange={handleCommonChange}
                    className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>
            )}

            {type === "client" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="-mt-10">
                  <label className="text-base font-semibold text-gray-800 mb-2 flex items-center">
                    <FaEnvelope className="mr-2 text-orange-600" />
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ""}
                    onChange={handleCommonChange}
                    className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div className="-mt-10">
                  <label className="text-base font-semibold text-gray-800 mb-2 flex items-center">
                    <FaPhone className="mr-2 text-green-600" />
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone || ""}
                    onChange={handleCommonChange}
                    className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                {type !== "client" && (
                  <div className="lg:col-span-2">
                    <label className="block text-base font-semibold text-gray-800 mb-2">
                      Address
                    </label>
                    <textarea
                      name="address"
                      rows="3"
                      value={formData.address || ""}
                      onChange={handleInputChange}
                      className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                )}
              </div>
            )}

            {type === "event" && (
              <>
                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-4">
                    Event Type *
                  </label>
                  <div className="flex bg-gradient-to-r from-gray-100 to-gray-200 p-1 rounded-2xl shadow-inner">
                    <button
                      type="button"
                      onClick={() => handleEventTypeChange("one-day")}
                      className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all shadow-sm ${
                        eventType === "one-day"
                          ? "bg-white border-2 border-emerald-500 text-emerald-700 shadow-md"
                          : "text-gray-700 hover:text-gray-900 hover:bg-white"
                      }`}
                    >
                      One Day Event
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEventTypeChange("multi-day")}
                      className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all shadow-sm ${
                        eventType === "multi-day"
                          ? "bg-white border-2 border-purple-500 text-purple-700 shadow-md"
                          : "text-gray-700 hover:text-gray-900 hover:bg-white"
                      }`}
                    >
                      Multi-Day Event
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {eventType === "one-day" ? (
                    <div>
                      <label className="text-base font-semibold text-gray-800 mb-3 flex items-center">
                        <FaCalendarAlt className="mr-2 text-orange-500" />
                        Event Date
                      </label>
                      <input
                        type="date"
                        name="eventDate"
                        value={formData.eventDate || ""}
                        onChange={handleInputChange}
                        className="w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-base font-semibold text-gray-800 mb-3">
                          Booking From
                        </label>
                        <input
                          type="date"
                          name="bookingFromDate"
                          value={formData.bookingFromDate || ""}
                          onChange={handleInputChange}
                          className="w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-base font-semibold text-gray-800 mb-3">
                          Booking To
                        </label>
                        <input
                          type="date"
                          name="bookingToDate"
                          value={formData.bookingToDate || ""}
                          onChange={handleInputChange}
                          className="w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                    </>
                  )}
                  <div>
                    <label className="text-base font-semibold text-gray-800 mb-3 flex items-center">
                      <FaClock className="mr-2 text-indigo-500" />
                      Event Time
                    </label>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <TimePicker
                        ampm
                        value={
                          formData.eventTime
                            ? dayjs(`1970-01-01 ${formData.eventTime}`)
                            : null
                        }
                        onChange={(newValue) => {
                          const timeStr = newValue
                            ? newValue.format("h:mm A")
                            : "";
                          setFormData((prev) => ({
                            ...prev,
                            eventTime: timeStr,
                          }));
                        }}
                        slotProps={{
                          textField: {
                            className:
                              "w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:border-indigo-500",
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </div>
                </div>
              </>
            )}

            {type === "tourism" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="text-base font-semibold text-gray-800 mb-3 flex items-center">
                    <FaClock className="mr-2 text-indigo-500" />
                    Open Time
                  </label>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <TimePicker
                      ampm
                      value={
                        formData.openTime24hr
                          ? dayjs(`1970-01-01T${formData.openTime24hr}`)
                          : null
                      }
                      onChange={(newValue) => {
                        const time12hr = newValue
                          ? newValue.format("h:mm A")
                          : "";
                        const time24hr = newValue
                          ? newValue.format("HH:mm")
                          : "";
                        setFormData((prev) => ({
                          ...prev,
                          openTime: time12hr,
                          openTime24hr: time24hr,
                        }));
                      }}
                      slotProps={{
                        textField: {
                          className:
                            "w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:border-indigo-500",
                        },
                      }}
                    />
                  </LocalizationProvider>
                </div>
                <div>
                  <label className="text-base font-semibold text-gray-800 mb-3 flex items-center">
                    <FaClock className="mr-2 text-orange-500" />
                    Close Time
                  </label>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <TimePicker
                      ampm
                      value={
                        formData.closeTime24hr
                          ? dayjs(`1970-01-01T${formData.closeTime24hr}`)
                          : null
                      }
                      onChange={(newValue) => {
                        const time12hr = newValue
                          ? newValue.format("h:mm A")
                          : "";
                        const time24hr = newValue
                          ? newValue.format("HH:mm")
                          : "";
                        setFormData((prev) => ({
                          ...prev,
                          closeTime: time12hr,
                          closeTime24hr: time24hr,
                        }));
                      }}
                      slotProps={{
                        textField: {
                          className:
                            "w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-500 focus:border-orange-500",
                        },
                      }}
                    />
                  </LocalizationProvider>
                </div>
              </div>
            )}

            {/* Blog-specific fields already handled above */}
            {/* Amenities & Policies Sections */}
            {type !== "client" && type !== "blog" && (
              <>
                {/* Amenities Section */}
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-2">
                    Amenities (optional)
                  </label>
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type="text"
                        value={newAmenity}
                        onChange={handleAmenitiesInput}
                        onKeyDown={handleAmenitiesKeyDown}
                        placeholder="Type amenity and press Enter (e.g., WiFi)"
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
                            suggestion
                              .toLowerCase()
                              .includes(newAmenity.toLowerCase()),
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
                                  ? "bg-emerald-100 border-l-4 border-emerald-500 text-emerald-800 font-semibold shadow-md"
                                  : "hover:bg-emerald-50 hover:text-emerald-700"
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
                      <label className="block text-base font-semibold text-gray-800 mb-2">
                        Sub-Amenities (optional)
                      </label>
                      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-3xl p-6 border-2 border-gray-200 shadow-xl">
                        {/* Tab Navigation */}
                        <div className="flex mb-6 border-b border-gray-200">
                          <button
                            type="button"
                            onClick={() => setActiveSubAmenityTab("basic")}
                            className={`pb-3 px-6 font-semibold text-sm ${
                              activeSubAmenityTab === "basic"
                                ? "text-indigo-600 border-b-2 border-indigo-600"
                                : "text-gray-600 hover:text-gray-900"
                            }`}
                          >
                            Basic Facilities
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveSubAmenityTab("room")}
                            className={`pb-3 px-6 font-semibold text-sm ${
                              activeSubAmenityTab === "room"
                                ? "text-purple-600 border-b-2 border-purple-600"
                                : "text-gray-600 hover:text-gray-900"
                            }`}
                          >
                            Room Amenities
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveSubAmenityTab("health")}
                            className={`pb-3 px-6 font-semibold text-sm ${
                              activeSubAmenityTab === "health"
                                ? "text-green-600 border-b-2 border-green-600"
                                : "text-gray-600 hover:text-gray-900"
                            }`}
                          >
                            Health & Wellness
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveSubAmenityTab("safety")}
                            className={`pb-3 px-6 font-semibold text-sm ${
                              activeSubAmenityTab === "safety"
                                ? "text-red-600 border-b-2 border-red-600"
                                : "text-gray-600 hover:text-gray-900"
                            }`}
                          >
                            Safety & Security
                          </button>
                        </div>

                        {/* Tab Content */}
                        {activeSubAmenityTab === "basic" && (
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
                                onClick={() =>
                                  addBasicFacility(newBasicFacility)
                                }
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
                                    suggestion
                                      .toLowerCase()
                                      .includes(newBasicFacility.toLowerCase()),
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
                                          ? "bg-indigo-100 border-l-4 border-indigo-500 text-indigo-800 font-semibold shadow-md"
                                          : "hover:bg-indigo-50 hover:text-indigo-700"
                                      }`}
                                    >
                                      {suggestion}
                                    </button>
                                  ))}
                              </div>
                            )}

                            {formData.basicFacilities.length > 0 && (
                              <div className="flex flex-wrap gap-2 p-4 bg-indigo-50 border-2 border-indigo-200 rounded-2xl">
                                {formData.basicFacilities.map(
                                  (facility, index) => (
                                    <div
                                      key={index}
                                      className="inline-flex items-center px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full text-base font-semibold shadow-sm"
                                    >
                                      {facility}
                                      <button
                                        type="button"
                                        onClick={() =>
                                          removeBasicFacility(index)
                                        }
                                        className="ml-2 text-indigo-600 hover:text-indigo-800 p-1 rounded-full hover:bg-indigo-200 transition-all"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  ),
                                )}
                                <span className="text-sm text-gray-500 ml-3 self-center">
                                  ({formData.basicFacilities.length}/20)
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {activeSubAmenityTab === "room" && (
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
                                    suggestion
                                      .toLowerCase()
                                      .includes(newRoomAmenity.toLowerCase()),
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
                                          ? "bg-purple-100 border-l-4 border-purple-500 text-purple-800 font-semibold shadow-md"
                                          : "hover:bg-purple-50 hover:text-purple-700"
                                      }`}
                                    >
                                      {suggestion}
                                    </button>
                                  ))}
                              </div>
                            )}

                            {formData.roomAmenities.length > 0 && (
                              <div className="flex flex-wrap gap-2 p-4 bg-purple-50 border-2 border-purple-200 rounded-2xl">
                                {formData.roomAmenities.map(
                                  (amenity, index) => (
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
                                  ),
                                )}
                                <span className="text-sm text-gray-500 ml-3 self-center">
                                  ({formData.roomAmenities.length}/20)
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {activeSubAmenityTab === "health" && (
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
                                    suggestion
                                      .toLowerCase()
                                      .includes(newHealthItem.toLowerCase()),
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
                                          ? "bg-green-100 border-l-4 border-green-500 text-green-800 font-semibold shadow-md"
                                          : "hover:bg-green-50 hover:text-green-700"
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

                        {activeSubAmenityTab === "safety" && (
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
                                    suggestion
                                      .toLowerCase()
                                      .includes(newSafetyItem.toLowerCase()),
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
                                          ? "bg-red-100 border-l-4 border-red-500 text-red-800 font-semibold shadow-md"
                                          : "hover:bg-red-50 hover:text-red-700"
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
                  <label className="block text-base font-semibold text-gray-800 mb-2">
                    Policies & Rules (optional)
                  </label>
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type="text"
                        value={newPolicy}
                        onChange={handlePoliciesInput}
                        onKeyDown={handlePoliciesKeyDown}
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
                            suggestion
                              .toLowerCase()
                              .includes(newPolicy.toLowerCase()),
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
                                  ? "bg-amber-100 border-l-4 border-amber-500 text-amber-800 font-semibold shadow-md"
                                  : "hover:bg-amber-50 hover:text-amber-700"
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
              </>
            )}

            {config.hasImages && (
              <div>
                <label className="text-base font-semibold text-gray-800 mb-2 flex items-center">
                  <FaImage className="mr-3 h-7 w-7 text-blue-500" />
                  {type === "hotel"
                    ? "Hotel Images"
                    : type === "event"
                      ? "Event Images"
                      : type === "tourism"
                        ? "Tourism Images"
                        : config.imageField === "profilePicture"
                          ? "Profile Picture"
                          : "Images"}
                </label>

                {existingImages.length > 0 && (
                  <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200">
                    <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                      Current Images (
                      {existingImages.length - imagesToRemove.size})
                    </h4>
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                      {existingImages
                        .filter((img) => !imagesToRemove.has(img))
                        .map((imgSrc, idx) => {
                          const actualIdx = existingImages.indexOf(imgSrc);
                          return (
                            <div
                              key={`existing-${imgSrc}`}
                              className="group relative overflow-hidden rounded-2xl shadow-lg bg-gradient-to-br from-gray-50 to-gray-100 aspect-square hover:shadow-2xl transition-all"
                            >
                              <img
                                src={imgSrc}
                                alt={`Current ${actualIdx + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveImage(actualIdx, true)
                                }
                                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-2xl flex items-center justify-center text-lg font-bold shadow-2xl opacity-0 group-hover:opacity-100 transition-all z-20"
                                title="Remove this image"
                              >
                                ×
                              </button>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

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
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center space-y-4"
                  >
                    <FaUpload className="h-8 w-8 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                    <div>
                      <p className="text-lg font-bold text-gray-900 group-hover:text-emerald-700">
                        Click to upload photos
                      </p>
                      <p className="text-base text-gray-600 mt-1">
                        PNG, JPG up to 10MB
                      </p>
                    </div>
                  </label>
                </div>

                {imagePreviews.length > existingImages.length && (
                  <div className="mt-8">
                    <h4 className="text-base font-semibold text-gray-900 mb-6">
                      New Images ({imagePreviews.length - existingImages.length}
                      )
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {imagePreviews
                        .slice(existingImages.length)
                        .map((preview, idx) => (
                          <div
                            key={`new-${idx}`}
                            className="group relative overflow-hidden rounded-2xl aspect-square bg-gradient-to-br from-emerald-50 to-emerald-100 shadow-lg hover:shadow-2xl transition-all"
                          >
                            <img
                              src={preview}
                              alt={`New ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx, false)}
                              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-2xl flex items-center justify-center text-lg font-bold shadow-2xl opacity-0 group-hover:opacity-100 transition-all z-20"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-200 justify-center">
              <Link
                to={backPath}
                className="sm:w-auto bg-gradient-to-r from-gray-200 to-gray-300 text-gray-900 py-5 px-8 rounded-2xl hover:from-gray-300 hover:to-gray-400 font-bold text-lg shadow-lg transition-all text-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="sm:w-auto bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-5 px-8 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
              >
                {saving ? (
                  <>
                    <FaSpinner className="h-5 w-5 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <span>Update {config.title.replace(/^Edit /, "")}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminEdit;
