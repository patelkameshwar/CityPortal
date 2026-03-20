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
  FaUsers as UsersIcon
} from "react-icons/fa";
import { toast } from "react-toastify";
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const AdminEdit = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [itemData, setItemData] = useState(null);
  const [formData, setFormData] = useState({});
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToRemove, setImagesToRemove] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [eventType, setEventType] = useState('one-day');

  const typeConfig = {
    client: {
      title: 'Edit Client',
      icon: FaUser,
      apiPath: `/admin/clients/${id}`,
      backLabel: 'Clients',
      fieldMap: {
        title: 'name',
        email: 'email',
        phone: 'phone',
        address: 'address'
      },
      hasImages: true, 
      imageField: 'profilePicture'
    },
    hotel: {
      title: 'Edit Hotel',
      icon: FaHotel,
      apiPath: `/hotels/${id}`,
      backLabel: 'Hotels',
      fieldMap: {
        title: 'name',
        price: 'pricePerNight',
        capacity: 'totalRooms',
        extra: 'amenities'
      },
      hasImages: true,
      imageField: 'images'
    },
    event: {
      title: 'Edit Event',
      icon: FaCalendarAlt,
      apiPath: `/events/${id}`,
      backLabel: 'Events',
      fieldMap: {
        title: 'title',
        price: 'price',
        capacity: 'totalSeats'
      },
      hasImages: true,
      imageField: 'images'
    },
    tourism: {
      title: 'Edit Tourism',
      icon: FaMapMarkerAlt,
      apiPath: `/tourism/${id}`,
      backLabel: 'Tourism',
      fieldMap: {
        title: 'name',
        price: 'entryFee',
        capacity: 'totalVisitors',
        openTime: 'openTime',
        closeTime: 'closeTime'
      },
      hasImages: true,
      imageField: 'images'
    }
  };

  const config = typeConfig[type] || typeConfig.client;

  const backPath = location.state?.from || (type ? `/admin/${type}s` : '/admin-dashboard');
  const backLabel = location.state?.fromLabel || config.backLabel || (type ? `${type.charAt(0).toUpperCase() + type.slice(1)}s` : 'Dashboard');

const formatTime = (timeStr) => {
    if (!timeStr) return '';
    // Handle 12hr AM/PM format -> 24hr for <input type="time">
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return timeStr; // fallback if format unexpected
    let [hours, minutes, period] = [parseInt(match[1]), parseInt(match[2]), match[3].toUpperCase()];
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return `${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}`;
  };

  const mapApiDataToForm = (apiData) => {
    const mapped = {
      title: apiData[config.fieldMap.title] || "",
      description: apiData.description || "",
      location: apiData.location || "",
      ...(config.fieldMap.price && { price: apiData[config.fieldMap.price] || "" }),
      ...(config.fieldMap.capacity && { capacity: apiData[config.fieldMap.capacity] || "" }),
      ...(config.fieldMap.extra && { [config.fieldMap.extra]: apiData[config.fieldMap.extra] || "" }),
      ...(config.fieldMap.email && { email: apiData.email || "" }),
      ...(config.fieldMap.phone && { phone: apiData.phone || "" }),
      ...(config.fieldMap.address && { address: apiData.address || "" }),
      ...(type === 'event' && {
        eventType: apiData.eventDate ? "one-day" : "multi-day",
        eventTime: apiData.eventTime || "",
        eventDate: apiData.eventDate ? new Date(apiData.eventDate).toISOString().split('T')[0] : "",
        bookingFromDate: apiData.bookingFromDate ? new Date(apiData.bookingFromDate).toISOString().split('T')[0] : "",
        bookingToDate: apiData.bookingToDate ? new Date(apiData.bookingToDate).toISOString().split('T')[0] : ""
      }),
      ...(type === 'tourism' && {
        openTime: formatTime(apiData.openTime),
        closeTime: formatTime(apiData.closeTime)
      }),
      images: apiData.images || [],
      profilePicture: apiData.profilePicture || ""
    };
    return mapped;
  };

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await api.get(config.apiPath);
        const apiItem = response.data.event || response.data.hotel || response.data.tourism || response.data.client || response.data;
        const formDataMapped = mapApiDataToForm(apiItem);
        setFormData(formDataMapped);
        setEventType(formDataMapped.eventType || 'one-day');

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

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'images') {
      handleImageUpload(files);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleEventTypeChange = (newType) => {
  setEventType(newType);

  setFormData(prev => ({
    ...prev,
    eventType: newType,

    ...(newType === 'one-day'
      ? {
          eventDate: prev.eventDate || "",
          bookingFromDate: "",
          bookingToDate: ""
        }
      : {
          eventDate: "",
          bookingFromDate: prev.bookingFromDate || "",
          bookingToDate: prev.bookingToDate || ""
        })
  }));
};

  const handleImageUpload = (files) => {
    const newFiles = Array.from(files);
    setImageFiles(prev => [...prev, ...newFiles]);
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const handleRemoveImage = (index, isExisting = false) => {
    if (isExisting) {
      const imageUrl = existingImages[index];
      const newSet = new Set(imagesToRemove);
      newSet.add(imageUrl);
      setImagesToRemove(newSet);
      setImagePreviews(prev => prev.filter((_, i) => i !== index));
    } else {
      setImageFiles(prev => prev.filter((_, i) => i !== index));
      const preview = imagePreviews[existingImages.length + index];
      if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview);
      setImagePreviews(prev => prev.filter((_, i) => i !== existingImages.length + index));
    }
  };

  const validateForm = () => {
    if (!formData.title?.trim()) {
      toast.error("Title is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || saving) return;

    setSaving(true);
    try {
      const submitData = new FormData();
      Object.keys(formData).forEach((key) => {
  if (
    key !== 'images' &&
    key !== 'profilePicture' &&
    key !== 'eventDate' &&
    key !== 'bookingFromDate' &&
    key !== 'bookingToDate' &&
    key !== 'eventType'
  ) {
    submitData.append(key, formData[key] || '');
  }
});

      // Hotel-specific field mapping
      if (type === 'hotel') {
        submitData.set('name', formData.title || '');
        submitData.set('pricePerNight', formData.price || '');
        submitData.set('totalRooms', formData.capacity || '');
        submitData.set('location', formData.location || '');
        submitData.set('description', formData.description || '');
      }

      // Tourism-specific field mapping
      if (type === 'tourism') {
        submitData.set('name', formData.title || '');
        submitData.set('entryFee', formData.price || '');
        submitData.set('totalVisitors', formData.capacity || '');
        submitData.set('location', formData.location || '');
        submitData.set('description', formData.description || '');
        submitData.set('openTime', formData.openTime || '');
        submitData.set('closeTime', formData.closeTime || '');
      }

      // Event-specific mapping (fixed/cleaned)
      if (type === 'event') {
        submitData.set('title', formData.title || '');
        submitData.set('price', formData.price || '');
        submitData.set('totalSeats', formData.capacity || '');
        submitData.set('eventType', eventType);
        submitData.set('location', formData.location || '');
        submitData.set('description', formData.description || '');
        if (eventType === 'one-day') {
          submitData.set('eventDate', formData.eventDate || '');
          submitData.set('bookingFromDate', '');
          submitData.set('bookingToDate', '');
        } else {
          submitData.set('bookingFromDate', formData.bookingFromDate || '');
          submitData.set('bookingToDate', formData.bookingToDate || '');
          submitData.set('eventDate', '');
        }
      }
      if (imagesToRemove.size > 0) {
        submitData.append('imagesToRemove', Array.from(imagesToRemove).join(','));
      }

      imageFiles.forEach((file, index) => {
        submitData.append('images', file);
      });

      await api.put(config.apiPath, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success(`${config.title} updated successfully!`);
      navigate(backPath, { state: { from: location.pathname, fromLabel: config.title } });
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
                  <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-emerald-500 flex items-center justify-center text-white font-semibold text-xs">
                    {user?.name?.[0]?.toUpperCase() || 'A'}
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
                {React.createElement(config.icon, { className: "h-10 w-10 text-emerald-600" })}
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                  {config.title}
                </h1>
Update your {config.title.replace(/^Edit /, '')} listing
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Basic Info Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <label className="block text-base font-semibold text-gray-800 mb-3">
{type === 'hotel' ? 'Hotel Name' : type === 'event' ? 'Event Title' : type === 'tourism' ? 'Tourism Name' : 'Name'} *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title || ""}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  required
                />
              </div>

              {config.fieldMap?.price && (
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-3 flex items-center">
                    <RupeeIcon className="mr-2 text-emerald-600" />
{type === 'hotel' ? 'Price per Night' : type === 'event' ? 'Price per Seat' : type === 'tourism' ? 'Entry Fee' : 'Price'} *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price || ""}
                    onChange={handleInputChange}
                    min="0"
                    step="1"
                    className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    required
                  />
                </div>
              )}
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
                  value={formData.location || ""}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>

              {config.fieldMap?.capacity && (
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-3 flex items-center">
                    <UsersIcon className="mr-2 text-purple-600" />
{type === 'hotel' ? 'Total Rooms' : type === 'event' ? 'Total Seats' : type === 'tourism' ? 'Total Visitors per day' : 'Capacity'} *
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity || ""}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-base font-semibold text-gray-800 mb-4">
                Description
              </label>
              <textarea
                name="description"
                rows="5"
                value={formData.description || ""}
                onChange={handleInputChange}
                className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-500 focus:border-emerald-500 resize-vertical leading-relaxed"
              />
            </div>

            {/* Type-specific sections */}
            {type === 'client' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-3 flex items-center">
                    <FaEnvelope className="mr-2 text-orange-600" />
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ""}
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-3 flex items-center">
                    <FaPhone className="mr-2 text-green-600" />
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone || ""}
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-base font-semibold text-gray-800 mb-3">
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
              </div>
            )}

            {type === 'event' && (
              <>
                {/* Event Type Selector */}
                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-4">
                    Event Type *
                  </label>
                  <div className="flex bg-gradient-to-r from-gray-100 to-gray-200 p-1 rounded-2xl shadow-inner">
                    <button
                      type="button"
                      onClick={() => handleEventTypeChange('one-day')}
                      className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all shadow-sm ${
                        eventType === 'one-day'
                          ? 'bg-white border-2 border-emerald-500 text-emerald-700 shadow-md'
                          : 'text-gray-700 hover:text-gray-900 hover:bg-white'
                      }`}
                    >
                      One Day Event
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEventTypeChange('multi-day')}
                      className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all shadow-sm ${
                        eventType === 'multi-day'
                          ? 'bg-white border-2 border-purple-500 text-purple-700 shadow-md'
                          : 'text-gray-700 hover:text-gray-900 hover:bg-white'
                      }`}
                    >
                      Multi-Day Event
                    </button>
                  </div>
                </div>

                {/* Event Dates/Time */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {eventType === 'one-day' ? (
                    <div>
                      <label className="block text-base font-semibold text-gray-800 mb-3 flex items-center">
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
                    <label className="block text-base font-semibold text-gray-800 mb-3 flex items-center">
                      <FaClock className="mr-2 text-indigo-500" />
                      Event Time
                    </label>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <TimePicker
                        ampm
                        value={formData.eventTime ? dayjs(`1970-01-01 ${formData.eventTime}`) : null}
                        onChange={(newValue) => {
                          const timeStr = newValue ? newValue.format('h:mm A') : '';
                          setFormData(prev => ({ ...prev, eventTime: timeStr }));
                        }}
                        slotProps={{
                          textField: {
                            className: 'w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:border-indigo-500'
                          }
                        }}
                      />
                    </LocalizationProvider>
                  </div>
                </div>
              </>
            )}

            {type === 'tourism' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-3 flex items-center">
                    <FaClock className="mr-2 text-indigo-500" />
                    Open Time
                  </label>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <TimePicker
                      ampm
                      value={formData.openTime ? dayjs(`1970-01-01 ${formData.openTime}`) : null}
                      onChange={(newValue) => {
                        const timeStr = newValue ? newValue.format('h:mm A') : '';
                        setFormData(prev => ({ ...prev, openTime: timeStr }));
                      }}
                      slotProps={{
                        textField: {
                          className: 'w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:border-indigo-500'
                        }
                      }}
                    />
                  </LocalizationProvider>
                </div>
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-3 flex items-center">
                    <FaClock className="mr-2 text-orange-500" />
                    Close Time
                  </label>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <TimePicker
                      ampm
                      value={formData.closeTime ? dayjs(`1970-01-01 ${formData.closeTime}`) : null}
                      onChange={(newValue) => {
                        const timeStr = newValue ? newValue.format('h:mm A') : '';
                        setFormData(prev => ({ ...prev, closeTime: timeStr }));
                      }}
                      slotProps={{
                        textField: {
                          className: 'w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-500 focus:border-orange-500'
                        }
                      }}
                    />
                  </LocalizationProvider>
                </div>
              </div>
            )}

            {config.fieldMap?.extra && (
              <div>
                <label className="block text-base font-semibold text-gray-800 mb-4">
                  Amenities (Optional)
                </label>
                <textarea
                  name={config.fieldMap.extra}
                  rows="3"
                  value={formData[config.fieldMap.extra] || ""}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-500 focus:border-emerald-500 resize-vertical"
                  placeholder="WiFi, AC, Parking, Pool, Gym, Free Breakfast, 24/7 Room Service..."
                />
                <p className="mt-2 text-sm text-gray-500 italic">
                  Comma-separated list. Highlight your best features!
                </p>
              </div>
            )}

            {/* Images Section */}
            {config.hasImages && (
              <div>
                <label className="block text-base font-semibold text-gray-800 mb-5 flex items-center">
                  <FaImage className="mr-3 h-7 w-7 text-blue-500" />
{type === 'hotel' ? 'Hotel Images' : type === 'event' ? 'Event Images' : type === 'tourism' ? 'Tourism Images' : config.imageField === 'profilePicture' ? 'Profile Picture' : 'Images'}
                </label>
                
                {existingImages.length > 0 && (
                  <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200">
                    <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                      Current Images ({existingImages.length - imagesToRemove.size})
                    </h4>
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                      {existingImages
                        .filter(img => !imagesToRemove.has(img))
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
                    </div>
                  </div>
                )}

                {/* Upload New Images */}
                <div className="border-4 border-dashed border-gray-300 rounded-3xl p-4 text-center hover:border-emerald-400 hover:bg-emerald-50 transition-all group cursor-pointer bg-gradient-to-b from-gray-50 to-white shadow-xl">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleInputChange}
                    name="images"
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center space-y-4">
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

                {/* New Image Previews */}
                {imagePreviews.length > existingImages.length && (
                  <div className="mt-8">
                    <h4 className="text-base font-semibold text-gray-900 mb-6">
                      New Images ({imagePreviews.length - existingImages.length})
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {imagePreviews.slice(existingImages.length).map((preview, idx) => (
                        <div key={`new-${idx}`} className="group relative overflow-hidden rounded-2xl aspect-square bg-gradient-to-br from-emerald-50 to-emerald-100 shadow-lg hover:shadow-2xl transition-all">
                          <img src={preview} alt={`New ${idx + 1}`} className="w-full h-full object-cover" />
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
                  <span>Update {config.title.replace(/^Edit /, '')}</span>
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
