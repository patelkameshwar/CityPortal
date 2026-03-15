import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import api, { eventAPI } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { FaArrowLeft, FaCalendarAlt, FaMapMarkerAlt, FaImage, FaRupeeSign, FaClock, FaUsers, FaUpload, FaSpinner, FaPlus, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const EditItems = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    eventType: "one-day",
    eventTime: "",
    eventDate: "",
    bookingFromDate: "",
    bookingToDate: "",
    price: "",
    totalSeats: "",
    images: [],
  });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch existing event data
useEffect(() => {
    console.log('🔍 EditItems - useEffect triggered, id:', id);
    const fetchEvent = async () => {
      try {
        console.log('🚀 Calling eventAPI.getById(', id, ')');
        const response = await eventAPI.getById(id);
        console.log('📡 API Response:', response);
        console.log('📄 Event data:', response.data);
        const apiEvent = response.data.event; // Backend wraps event in {success, event, eventDates}
        console.log('🎯 Raw API event:', apiEvent);
        
        const getFormattedDate = (dateStr) => {
          if (!dateStr) return "";
          const date = new Date(dateStr);
          return !isNaN(date.getTime()) ? date.toISOString().split('T')[0] : "";
        };

        const populatedData = {
          title: apiEvent?.title || "",
          description: apiEvent?.description || "",
          location: apiEvent?.location || "",
          eventType: !!apiEvent?.eventDate ? "one-day" : "multi-day",
          eventTime: apiEvent?.eventTime || "",
          eventDate: getFormattedDate(apiEvent?.eventDate),
          bookingFromDate: getFormattedDate(apiEvent?.bookingFromDate),
          bookingToDate: getFormattedDate(apiEvent?.bookingToDate),
          price: apiEvent?.price || "",
          totalSeats: apiEvent?.totalSeats || "",
          images: apiEvent?.images || [],
        };
        console.log('💾 Setting formData with:', populatedData);
        setFormData(populatedData);
        // Set existing images for preview (non-editable)
        if (apiEvent?.images && apiEvent.images.length > 0) {
          setExistingImages(apiEvent.images);
          setImagePreviews(apiEvent.images.map(img => img));  // URLs already
        }
      } catch (error) {
        console.error('💥 FetchEvent ERROR for ID', id, ':', error);
        console.error('Response status:', error.response?.status);
        console.error('Response data:', error.response?.data);
        console.error('Full error:', error);
        toast.error("Failed to load event data");
        navigate("/client/my-events");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'images') {
      const newFiles = Array.from(files);
      setImageFiles(prev => [...prev, ...newFiles]);
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
      setFormData(prev => ({ ...prev, images: [...(prev.images || []), ...newFiles] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleEventTypeChange = (type) => {
    setFormData(prev => ({ ...prev, eventType: type }));
    if (type === 'one-day' && formData.bookingFromDate) {
      setFormData(prev => ({ ...prev, bookingToDate: prev.bookingFromDate }));
    }
  };

  const handleEventDateChange = (e) => {
    const date = e.target.value;
    setFormData(prev => ({
      ...prev, 
      eventDate: date,
      bookingFromDate: date,
      bookingToDate: date
    }));
  };

  const handleRemoveNewImage = (index) => {
    const newPreviews = imagePreviews.filter((_, i) => i >= existingImages.length || i !== index);
    const newFiles = imageFiles.filter((_, i) => i !== index - existingImages.length);
    setImagePreviews(newPreviews);
    setImageFiles(newFiles);
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    URL.revokeObjectURL(imagePreviews[index]);
  };

  const handleAddMoreImages = (e) => {
    const newFiles = Array.from(e.target.files);
    setImageFiles(prev => [...prev, ...newFiles]);
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
    setFormData(prev => ({ ...prev, images: [...(prev.images || []), ...newFiles] }));
    e.target.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    // Validation (same as AddEvent)
    if (formData.eventType === 'one-day') {
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

    setSaving(true);
    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (key !== 'images' && formData[key]) {
          submitData.append(key, formData[key]);
        }
      });
      if (formData.images && formData.images.length > 0) {
        formData.images.forEach(image => {
          submitData.append('images', image);
        });
      }

      await eventAPI.update(id, submitData);
      toast.success("Event updated successfully!");
      navigate("/client/my-events");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update event");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (formData.eventType === 'one-day' && formData.eventDate && formData.bookingFromDate !== formData.eventDate) {
      setFormData(prev => ({ ...prev, bookingFromDate: prev.eventDate, bookingToDate: prev.eventDate }));
    }
  }, [formData.eventType, formData.eventDate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <FaSpinner className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
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
                  <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover rounded-full" />
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
              Edit Event
            </h1>
            <p className="text-gray-600 mt-2">Update your event listing for CityPortal</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Title & Description - same as AddEvent */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Title *</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Price per Seat (₹) *</label>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Event Description *</label>
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

            {/* Location & Event Time */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
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
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <FaClock className="mr-2 text-gray-500" />
                  Event Time *
                </label>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <TimePicker
                    ampm
                    views={['hours', 'minutes']}
                    value={formData.eventTime ? dayjs(`1970-01-01 ${formData.eventTime}`, 'YYYY-MM-DD h:mm A') : null}
                    onChange={(newValue) => {
                      const timeStr = newValue ? newValue.format('h:mm A') : '';
                      setFormData(prev => ({ ...prev, eventTime: timeStr }));
                    }}
                    slotProps={{
                      textField: {
                        className: "w-full px-4 py-3 border border-gray-300 rounded-xl focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 shadow-sm text-sm hover:bg-gray-50 transition-all",
                        placeholder: "Select time (e.g., 2:30 PM)",
                        required: true
                      }
                    }}
                  />
                </LocalizationProvider>
              </div>
            </div>

            {/* Event Type & Dates & Seats - same logic */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Event Duration *</label>
                <div className="flex bg-gray-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => handleEventTypeChange('one-day')}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                      formData.eventType === 'one-day'
                        ? 'bg-white shadow-sm border-2 border-emerald-500 text-emerald-700'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    One Day Event
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEventTypeChange('multi-day')}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                      formData.eventType === 'multi-day'
                        ? 'bg-white shadow-sm border-2 border-emerald-500 text-emerald-700'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Multi-Day Event
                  </button>
                </div>
              </div>

              {formData.eventType === 'one-day' ? (
                <div className="grid grid-cols Ascent 1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
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
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Booking From *</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Booking To *</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
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
            </div>

            {/* Images - show existing + allow new */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4 flex items-center">
                <FaImage className="mr-2 text-gray-500" />
                Event Images
              </label>
              {existingImages.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Current Images ({existingImages.length})</h4>
                  <div className="flex gap-3 pb-3 overflow-x-auto scrollbar-thin">
                    {existingImages.slice(0, 10).map((imgSrc, index) => (
                      <div key={`existing-${index}`} className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shadow-sm">
                        <img src={imgSrc} alt={`Current ${index + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {existingImages.length > 10 && (
                      <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 font-medium text-sm border">
                        +{existingImages.length - 10}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">Add new images below to append/override.</p>
                </div>
              )}
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-emerald-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleChange}
                  name="images"
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
                  <FaUpload className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-1">Click to upload new images</p>
                  <p className="text-sm text-gray-500">PNG, JPG (max 50 images, 10MB each)</p>
                </label>
              </div>
              {imagePreviews.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium text-gray-900">New Images ({imagePreviews.length})</h4>
                    <label htmlFor="add-more-images" className="flex items-center text-emerald-600 hover:text-emerald-700 text-sm font-medium cursor-pointer">
                      <FaPlus className="w-4 h-4 mr-1" />
                      Add more
                    </label>
                  </div>
                  <div className="flex gap-3 pb-3 overflow-x-auto scrollbar-thin">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden relative bg-gray-100 group hover:shadow-md">
                        <img src={preview} alt={`New ${index + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveNewImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-all z-10"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <input type="file" id="add-more-images" accept="image/*" multiple onChange={handleAddMoreImages} className="hidden" />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <Link
                to="/client/my-events"
                className="px-8 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium transition flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <FaSpinner className="animate-spin h-4 w-4" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <span>Update Event</span>
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
