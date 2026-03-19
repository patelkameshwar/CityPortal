import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { tourismAPI } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  FaMapMarkedAlt,
  FaArrowLeft,
  FaSpinner,
  FaImage,
  FaMapMarkerAlt,
  FaDollarSign,
  FaCalendarAlt,
  FaUsers,
  FaClock,
  FaPlus,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const AddTourism = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    entryFee: "",
    openTime: "",
    closeTime: "",
    bookingFromDate: "",
    bookingFromTime: "",
    bookingToDate: "",
    bookingToTime: "",
    totalVisitors: "",
    images: [],
  });
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

  const handleTimeChange = (name, newValue) => {
    const timeStr = newValue ? newValue.format('h:mm A') : '';
    setFormData((prev) => ({ ...prev, [name]: timeStr }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.description ||
      !formData.location ||
      !formData.entryFee ||
      !formData.bookingFromDate ||
      !formData.bookingToDate ||
      !formData.bookingFromTime ||
      !formData.bookingToTime ||
      !formData.totalVisitors
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    const submitData = new FormData();
    submitData.append("name", formData.name);
    submitData.append("description", formData.description);
    submitData.append("location", formData.location);
    submitData.append("entryFee", formData.entryFee);
    submitData.append("openTime", formData.openTime);
    submitData.append("closeTime", formData.closeTime);
    submitData.append("bookingFromDate", formData.bookingFromDate);
    submitData.append("bookingFromTime", formData.bookingFromTime);
    submitData.append("bookingToDate", formData.bookingToDate);
    submitData.append("bookingToTime", formData.bookingToTime);
    submitData.append("totalVisitors", formData.totalVisitors);
    formData.images?.forEach((image) => {
      submitData.append("images", image);
    });

    setSubmitting(true);
    try {
      await tourismAPI.create(submitData);
      toast.success("Tourism spot created successfully!");
      navigate("/admin/tourism");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create tourism spot");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center p-8">
          <FaMapMarkedAlt className="h-16 w-16 text-gray-400 mx-auto mb-4" />
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
                to="/admin/tourism"
                className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaArrowLeft />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Add New Tourism Spot
                </h1>
                <p className="text-gray-600 mt-1">
                  List your tourism attraction on CityPortal
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-xl rounded-xl border border-gray-200 overflow-hidden">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Tourism Spot Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg placeholder-gray-400"
                  placeholder="Enter tourism spot name"
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
                  placeholder="Describe the tourism spot, attractions, history, visitor tips..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Location *
                  </label>
                  <div className="relative">
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
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Entry Fee * (₹)
                  </label>
                  <div className="relative">
                    <FaDollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      name="entryFee"
                      value={formData.entryFee}
                      onChange={handleInputChange}
                      min="0"
                      step="10"
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <FaCalendarAlt className="mr-2 text-gray-400" />
                    Booking From Date *
                  </label>
                  <input
                    type="date"
                    name="bookingFromDate"
                    value={formData.bookingFromDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <FaCalendarAlt className="mr-2 text-gray-400" />
                    Booking To Date *
                  </label>
                  <input
                    type="date"
                    name="bookingToDate"
                    value={formData.bookingToDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <FaClock className="mr-2 text-gray-400" />
                    Open Time
                  </label>
                  <TimePicker
                    ampm
                    views={["hours", "minutes"]}
                    value={
                      formData.openTime
                        ? dayjs(
                            `1970-01-01 ${formData.openTime}`,
                            "YYYY-MM-DD h:mm A",
                          )
                        : null
                    }
                    onChange={(newValue) => {
                      const timeStr = newValue ? newValue.format("h:mm A") : "";
                      setFormData((prev) => ({ ...prev, openTime: timeStr }));
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
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <FaClock className="mr-2 text-gray-400" />
                    Close Time
                  </label>
                  <TimePicker
                    ampm
                    views={["hours", "minutes"]}
                    value={
                      formData.closeTime
                        ? dayjs(
                            `1970-01-01 ${formData.closeTime}`,
                            "YYYY-MM-DD h:mm A",
                          )
                        : null
                    }
                    onChange={(newValue) => {
                      const timeStr = newValue ? newValue.format("h:mm A") : "";
                      setFormData((prev) => ({ ...prev, closeTime: timeStr }));
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
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <FaCalendarAlt className="mr-2 text-gray-400" />
                    Booking From Time *
                  </label>
                  <TimePicker
                    ampm
                    views={["hours", "minutes"]}
                    value={
                      formData.bookingFromTime
                        ? dayjs(
                            `1970-01-01 ${formData.bookingFromTime}`,
                            "YYYY-MM-DD h:mm A",
                          )
                        : null
                    }
                    onChange={(newValue) => {
                      const timeStr = newValue ? newValue.format("h:mm A") : "";
                      setFormData((prev) => ({ ...prev, bookingFromTime: timeStr }));
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
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <FaCalendarAlt className="mr-2 text-gray-400" />
                    Booking To Time *
                  </label>
                  <TimePicker
                    ampm
                    views={["hours", "minutes"]}
                    value={
                      formData.bookingToTime
                        ? dayjs(
                            `1970-01-01 ${formData.bookingToTime}`,
                            "YYYY-MM-DD h:mm A",
                          )
                        : null
                    }
                    onChange={(newValue) => {
                      const timeStr = newValue ? newValue.format("h:mm A") : "";
                      setFormData((prev) => ({ ...prev, bookingToTime: timeStr }));
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
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <FaUsers className="mr-2 text-gray-400" />
                  Total Visitors per day *
                </label>
                <input
                  type="number"
                  name="totalVisitors"
                  value={formData.totalVisitors}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="100"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <FaImage className="mr-2 text-gray-400" />
                  Tourism Images
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
                  Upload up to 50 high-quality images (max 5MB each)
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
                      Creating Tourism Spot...
                    </>
                  ) : (
                    "List My Tourism Spot"
                  )}
                </button>
                <Link
                  to="/admin/tourism"
                  className="flex-1 sm:flex-none bg-gray-200 text-gray-900 py-4 px-6 rounded-xl hover:bg-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-500 font-semibold text-lg text-center shadow-sm transition-all duration-200"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </LocalizationProvider>
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
                  <FaUsers className="h-8 w-8 text-gray-500" />
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {user?.name || "Admin"}
                </p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>
            <Link
              to="/admin-dashboard"
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

export default AddTourism;

