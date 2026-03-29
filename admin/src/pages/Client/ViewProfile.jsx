import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { authAPI } from "../../services/api.js";
import { toast } from "react-toastify";
import { assets } from "../../assets/assets.js";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiArrowLeft,
  FiCamera,
  FiTrash2,
  FiLoader,
} from "react-icons/fi";

const ViewProfile = () => {
  const { user, logout, updateUser } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    address: { line1: "", line2: "" },
    gender: "",
    dob: "",
    image: "",
  });

  useEffect(() => {
    if (user) {
      let addressLine1 = "";
      let addressLine2 = "";
      if (user.address) {
        if (typeof user.address === "string") {
          const parts = user.address.split(",");
          addressLine1 = parts[0]?.trim() || "";
          addressLine2 = parts.slice(1).join(",").trim() || "";
        } else if (typeof user.address === "object") {
          addressLine1 = user.address.line1 || "";
          addressLine2 = user.address.line2 || "";
        }
      }

      setUserData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: { line1: addressLine1, line2: addressLine2 },
        gender: user.gender
          ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1)
          : "",
        dob: user.birthday ? user.birthday.split("T")[0] : "",
        image: user.profilePicture || "",
      });
    }
  }, [user]);

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
    setUserData((prev) => ({ ...prev, phone: val }));
  };

  const handleAddressLine1Change = (e) => {
    setUserData((prev) => ({
      ...prev,
      address: { ...prev.address, line1: e.target.value },
    }));
  };

  const handleAddressLine2Change = (e) => {
    setUserData((prev) => ({
      ...prev,
      address: { ...prev.address, line2: e.target.value },
    }));
  };

  const handleGenderChange = (e) => {
    setUserData((prev) => ({ ...prev, gender: e.target.value }));
  };

  const handleDobChange = (e) => {
    setUserData((prev) => ({ ...prev, dob: e.target.value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);

    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("profilePicture", file);
      const response = await authAPI.uploadProfilePicture(formData);
      if (response.data.success) {
        updateUser(response.data.user);
        toast.success("Profile picture updated!");
      }
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setSaving(false);
      setImageFile(null);
    }
  };

  const handleRemoveProfilePic = async () => {
    try {
      setSaving(true);
      const response = await authAPI.updateProfile({ profilePicture: "" });
      if (response.data.success) {
        updateUser(response.data.user);
        toast.success("Profile picture removed");
      }
    } catch (error) {
      toast.error("Failed to remove photo");
    } finally {
      setSaving(false);
    }
  };

  // --- Update Profile Logic ---
  const updateUserProfileData = async () => {
    try {
      setSaving(true);
      const response = await authAPI.updateProfile({
        name: userData.name,
        phone: userData.phone,
        address: userData.address,
        gender: userData.gender,
        birthday: userData.dob ? new Date(userData.dob) : null,
      });

      if (response.data.success) {
        updateUser(response.data.user);
        setIsEditMode(false);
        toast.success("Profile updated successfully!");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (!user)
    return (
      <div className="py-12 text-center text-gray-600">
        Please Login to continue.
      </div>
    );

  return (
    <div className="py-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Navigation */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => (window.location.href = "/client-dashboard")}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all shadow-sm"
          >
            <FiArrowLeft className="mr-2" /> Back to Dashboard
          </button>
        </div>

        <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          {/* Profile Image - Matches MyProfile Design */}
          <div className="flex flex-col items-center">
            <div className="group relative w-44 h-44">
              <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-md ring-1 ring-gray-200">
                <img
                  className={`w-full h-full object-cover transition-all duration-300 ${isEditMode ? "group-hover:scale-105 group-hover:brightness-90" : ""}`}
                  src={
                    imageFile
                      ? URL.createObjectURL(imageFile)
                      : userData.image || assets.defaultprofile
                  }
                  alt="Profile"
                />
              </div>

              {isEditMode && (
                <>
                  {saving ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-full z-20 backdrop-blur-[1px]">
                      <FiLoader className="text-blue-600 text-3xl animate-spin" />
                    </div>
                  ) : (
                    <>
                      {userData.image ? (
                        <button
                          onClick={handleRemoveProfilePic}
                          className="absolute inset-0 flex flex-col items-center justify-center bg-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-full z-10"
                        >
                          <div className="bg-black/40 p-3 rounded-full shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                            <FiTrash2 className="text-white text-2xl" />
                          </div>
                        </button>
                      ) : (
                        <label
                          htmlFor="image-input"
                          className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer z-10"
                        >
                          <FiCamera className="text-white text-2xl" />
                        </label>
                      )}
                      <label
                        htmlFor="image-input"
                        className="absolute bottom-2 right-2 bg-blue-600 p-2.5 rounded-full border-2 border-white text-white shadow-lg cursor-pointer hover:scale-110 transition-all z-20"
                      >
                        <FiCamera size={18} />
                      </label>
                    </>
                  )}
                  <input
                    type="file"
                    id="image-input"
                    hidden
                    onChange={handleImageUpload}
                    accept="image/*"
                    disabled={saving}
                  />
                </>
              )}
            </div>
            {isEditMode && !saving && (
              <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-3 font-bold">
                {userData.image ? "Hover to remove" : "Click camera to upload"}
              </p>
            )}
          </div>

          {/* Name */}
          <div className="flex justify-center mt-4">
            {isEditMode ? (
              <input
                className="bg-gray-50 text-3xl font-medium max-w-64 text-center border-b-2 border-blue-400 focus:outline-none"
                type="text"
                value={userData.name}
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            ) : (
              <p className="font-semibold text-3xl text-neutral-800  text-center">
                {userData.name}
              </p>
            )}
          </div>

          <hr className="bg-zinc-400 h-[1px] border-none my-4" />

          {/* Contact Information */}
          <div>
            <p className="text-neutral-500 underline mt-3">CONTACT INFORMATION</p>
            <div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-2 text-neutral-700">
              <p className="font-medium">Email:</p>
              <p className="text-blue-500">{userData.email}</p>

              <p className="font-medium">Phone:</p>
              {isEditMode ? (
                <input
                  className="bg-gray-100 max-w-52 px-3 py-1 rounded text-sm mt-1"
                  type="text"
                  value={userData.phone}
                  onChange={handlePhoneChange}
                  placeholder="10-digit phone number"
                  maxLength={10}
                />
              ) : (
                <p className="text-blue-500">
                  {userData.phone || "Not set"}
                </p>
              )}

              <p className="font-medium">Address:</p>
              {isEditMode ? (
                <div>
                  <input
                    className="bg-gray-100 w-full px-3 py-1 rounded text-sm"
                    value={userData.address.line1}
                    onChange={handleAddressLine1Change}
                    placeholder="Line 1"
                  />
                  <br />
                  <input
                    className="bg-gray-100 w-full px-3 py-1 rounded text-sm mt-1"
                    value={userData.address.line2}
                    onChange={handleAddressLine2Change}
                    placeholder="Line 2"
                  />
                </div>
              ) : (
                <p className="text-gray-500 leading-relaxed">
                  {userData.address.line1} {userData.address.line1 && <br />}{" "}
                  {userData.address.line2 ||
                    (userData.address.line1 ? "" : "Not set")}
                </p>
              )}
            </div>
          </div>

          {/* Basic Details Section */}
          <div>
            <p className="text-neutral-500 underline  mt-2">BASIC INFORMATION</p>
            <div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700">
              <p className="font-medium"> Gender:</p>
              {isEditMode ? (
                <select
                  className="max-w-24 bg-gray-100 px-3 py-1 rounded text-sm"
                  value={userData.gender}
                  onChange={handleGenderChange}
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <p className="text-gray-400">{userData.gender || "Not set"}</p>
              )}

              <p className="font-medium">Birthday:</p>
              {isEditMode ? (
                <input
                  className="max-w-32 bg-gray-100 px-3 py-1 rounded text-sm"
                  type="date"
                  value={userData.dob}
                  onChange={handleDobChange}
                />
              ) : (
                <p className="text-gray-400">
                  {userData.dob
                    ? new Date(userData.dob).toLocaleDateString()
                    : "Not set"}
                </p>
              )}
            </div>
          </div>

          {/* Bottom Action Buttons */}
          <div className="mt-10 flex justify-center gap-4">
            {isEditMode ? (
              <button
                onClick={updateUserProfileData}
                disabled={saving}
                className="border border-blue-600 text-blue-600 px-8 py-2 rounded-full hover:bg-blue-600 hover:text-white transition-all disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            ) : (
              <button
                onClick={() => setIsEditMode(true)}
                className="border border-blue-600 text-blue-600 px-16 py-2 rounded-full hover:bg-blue-600 hover:text-white transition-all"
              >
                Edit Profile
              </button>
            )}
            {isEditMode && (
              <button
                onClick={() => setIsEditMode(false)}
                className="border border-gray-500 text-gray-500 px-8 py-2 rounded-full hover:bg-gray-500 hover:text-white transition-all"
              >
                Cancel
              </button>
            )}
          </div>

          <hr className="bg-zinc-400 h-px border-none mt-8" />

          {/* Logout Button */}
          <div className="pt-6 flex justify-center">
            <button
              onClick={logout}
              className=" text-red-500 hover:text-red-700 text-sm font-medium"
            >
              Logout Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProfile;
