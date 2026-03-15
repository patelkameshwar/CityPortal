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
  const legacyId = useParams().id; // For /client/edit-event/:id fallback
  const itemId = id || legacyId;
  const itemType = type || 'event'; // Default to event for legacy route
  const isHotel = itemType === 'hotel';
  
  const apiService = isHotel ? hotelAPI : eventAPI;
  const backPath = isHotel ? '/client/my-hotels' : '/client/my-events';
  const pageTitle = isHotel ? 'Edit Hotel' : 'Edit Event';
  const icon = isHotel ? FaHotel : FaCalendarAlt;
  const capacityLabel = isHotel ? 'Total Rooms' : 'Total Seats';

  const [formData, setFormData] = useState({
    // Common fields
    title: "",
    description: "",
    location: "",
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
    amenities: "",
    pricePerNight: "",
    totalRooms: "",
    name: "",
  });
  
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
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
      price: apiData[map.price] || "",
      capacity: apiData[map.capacity] || "",
      ...(isHotel && { amenities: apiData.amenities || "" }),
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
      ...(isHotel && { amenities: formData.amenities }),
      ...(itemType === 'event' && ({
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
        if (apiItem.images?.length > 0) {
          setExistingImages(apiItem.images);
          setImagePreviews(apiItem.images);
        }
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

  const handleRemoveImage = (index) => {
    if (index < existingImages.length) {
      // Mark existing image for deletion (or ignore in update)
      return;
    }
    const fileIndex = index - existingImages.length;
    const preview = imagePreviews[index];
    URL.revokeObjectURL(preview);
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== fileIndex));
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
      
      // Append non-file fields
      Object.entries(apiPayload).forEach(([key, value]) => {
        if (value) submitData.append(key, value);
      });

      // Append new images
      imageFiles.forEach(file => {
        submitData.append('images', file);
      });

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
                <icon className="h-10 w-10 text-emerald-600" />
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
                <label className="block text-base font-semibold text-gray-800 mb-3 flex items-center">
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
              <div>
                <label className="block text-base font-semibold text-gray-800 mb-3 flex items-center">
                  <FaMapMarkerAlt className="mr-2 text-blue-600" />
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleCommonChange}
                  className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Downtown City Center, Main Street 123"
                  required
                />
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-800 mb-3 flex items-center">
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
            {itemType === 'event' ? (
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
                      <label className="block text-lg font-semibold text-gray-800 mb-3 flex items-center">
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
                    <label className="block text-lg font-semibold text-gray-800 mb-3 flex items-center">
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
            ) : (
              /* Hotel Amenities */
              <div>
                <label className="block text-base font-semibold text-gray-800 mb-4">
                  Amenities (optional)
                </label>
                <textarea
                  name="amenities"
                  rows="3"
                  value={formData.amenities}
                  onChange={handleCommonChange}
                  className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-500 focus:border-emerald-500 resize-vertical"
                  placeholder="WiFi, AC, Parking, Pool, Gym, Free Breakfast, 24/7 Room Service..."
                />
                <p className="mt-2 text-sm text-gray-500 italic">
                  Comma-separated list. Highlight your best features!
                </p>
              </div>
            )}

            {/* Images Section */}
            <div>
              <label className="block text-base font-semibold text-gray-800 mb-5 flex items-center">
                <FaImage className="mr-3 h-7 w-7 text-blue-500" />
                {isHotel ? 'Hotel Images' : 'Event Images'}
              </label>
              
              {existingImages.length > 0 && (
                <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200">
                  <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                    Current Images ({existingImages.length})
                  </h4>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                    {existingImages.slice(0, 10).map((imgSrc, idx) => (
                      <div key={`existing-${idx}`} className="group relative overflow-hidden rounded-2xl shadow-lg bg-gradient-to-br from-gray-50 to-gray-100 aspect-square hover:shadow-2xl transition-all">
                        <img src={imgSrc} alt={`Current ${idx + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white text-xs font-medium bg-black/50 px-2 py-1 rounded-full">
                            Current
                          </span>
                        </div>
                      </div>
                    ))}
                    {existingImages.length > 10 && (
                      <div className="col-span-1 md:col-span-1 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center shadow-lg font-semibold text-gray-600">
                        +{existingImages.length - 10}
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-blue-700 mt-3 font-medium">
                    Add new images below (existing images preserved)
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
              {imagePreviews.length > existingImages.length && (
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-base font-semibold text-gray-900">
                      New Images to Add ({imagePreviews.length - existingImages.length})
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {imagePreviews.slice(existingImages.length).map((preview, idx) => (
                      <div key={`new-${idx}`} className="group relative overflow-hidden rounded-2xl aspect-square bg-gradient-to-br from-emerald-50 to-emerald-100 shadow-lg hover:shadow-2xl transition-all">
                        <img src={preview} alt={`New ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(existingImages.length + idx)}
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

