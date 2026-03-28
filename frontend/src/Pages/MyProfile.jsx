import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../services/api";
import { assets } from "../assets/assets";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiCamera,
  FiTrash2,
  FiLoader,
} from "react-icons/fi";

const MyProfile = () => {
  const { user, logout, updateUser } = useAuth();
  const [isEdit, setIsEdit] = useState(false);
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // User data state
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
          addressLine1 = user.address.line1 || user.address.line2 || "";
          addressLine2 = user.address.line2 || "";
        }
      }

      setUserData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: {
          line1: addressLine1,
          line2: addressLine2,
        },
        gender: user.gender
          ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1)
          : "",
        dob: user.birthday ? user.birthday.split("T")[0] : "",
        image: user.profilePicture || "",
      });
    }
  }, [user]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("profilePicture", file);

      const response = await authAPI.uploadProfilePicture(formData);
      if (response.data.success) {
        updateUser(response.data.user);
        setUserData((prev) => ({
          ...prev,
          image: response.data.user.profilePicture,
        }));
        toast.success("Profile picture updated!");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to upload profile picture",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveProfilePic = async () => {
  // Removed the window.confirm alert block
  try {
    setSaving(true);
    const response = await authAPI.updateProfile({ profilePicture: "" });

    if (response.data.success) {
      setImage(null);
      setUserData((prev) => ({ ...prev, image: "" }));
      updateUser(response.data.user);
      toast.success("Profile picture removed");
    }
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to remove photo");
  } finally {
    setSaving(false);
  }
};

  const updateUserProfileData = async () => {
    try {
      setSaving(true);
      const response = await authAPI.updateProfile({
        name: userData.name,
        phone: userData.phone,
        address: userData.address, // Send the entire address object
        gender: userData.gender,
        birthday: userData.dob ? new Date(userData.dob) : null,
      });
      if (response.data.success) {
        // Parse the address from the response
        const updatedAddress = response.data.user.address || "";
        let line1 = "",
          line2 = "";
        if (updatedAddress) {
          const parts = updatedAddress.split(",");
          line1 = parts[0]?.trim() || "";
          line2 = parts.slice(1).join(",").trim() || "";
        }

        // Update local state with new data
        setUserData((prev) => ({
          ...prev,
          name: response.data.user.name,
          phone: response.data.user.phone,
          address: { line1, line2 },
          gender: response.data.user.gender
            ? response.data.user.gender.charAt(0).toUpperCase() +
              response.data.user.gender.slice(1)
            : "",
          dob: response.data.user.birthday
            ? response.data.user.birthday.split("T")[0]
            : "",
        }));

        updateUser(response.data.user);
        setIsEdit(false);
        toast.success("Profile updated successfully!");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  if (!user) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Please Login</h2>
        <p className="text-gray-600">You need to login to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center py-8">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-8">
        {/* Profile Image */}
        <div className="flex flex-col items-center">
          <div className="group relative w-46 h-46">
            <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-md ring-1 ring-gray-200">
              <img
                className={`w-full h-full object-cover transition-all duration-300 ${
                  isEdit
                    ? "group-hover:scale-105 group-hover:brightness-90"
                    : ""
                }`}
                src={
                  image
                    ? URL.createObjectURL(image)
                    : userData.image
                      ? userData.image
                      : assets.defaultprofile
                }
                alt="Profile"
              />
            </div>
            {isEdit && (
              <>
                {saving && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-full backdrop-blur-[1px] z-20">
                    <FiLoader className="text-blue-600 text-3xl animate-spin" />
                  </div>
                )}
                {!saving && (
                  <>
                    {userData.image ? (
                      <button
                        onClick={handleRemoveProfilePic}
                        className="absolute inset-0 flex flex-col items-center justify-center bg-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer z-10"
                        title="Remove Photo"
                      >
                        <div className="bg-black/20 p-3 rounded-full shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                          <FiTrash2 className="text-white text-2xl" />
                        </div>
                      </button>
                    ) : (
                      <label
                        htmlFor="image"
                        className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer z-10"
                      >
                        <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                          <FiCamera className="text-white text-2xl" />
                        </div>
                      </label>
                    )}
                    <label
                      htmlFor="image"
                      className="absolute bottom-1 right-1 bg-blue-600 p-2.5 rounded-full border-2 border-white text-white shadow-lg cursor-pointer hover:bg-blue-700 hover:scale-110 transition-all z-20"
                    >
                      <FiCamera size={18} />
                    </label>
                  </>
                )}

                <input
                  onChange={handleImageUpload}
                  type="file"
                  id="image"
                  hidden
                  accept="image/*"
                  disabled={saving}
                />
              </>
            )}
          </div>

          {/* Subtext indication */}
          {isEdit && !saving && (
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-3 font-semibold">
              {userData.image ? "Hover to remove" : "Click to upload"}
            </p>
          )}
        </div>

        {/* Name */}
        <div className="flex justify-center">
          {isEdit ? (
            <input
              className="bg-gray-50 text-3xl font-medium max-w-60 mt-4 text-center"
              type="text"
              value={userData.name}
              onChange={(e) =>
                setUserData((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          ) : (
            <p className="font-medium text-3xl text-neutral-800 mt-4 text-center">
              {userData.name}
            </p>
          )}
        </div>

        <hr className="bg-zinc-400 h-[1px] border-none my-4" />

        {/* Contact Information */}
        <div>
          <p className="text-neutral-500 underline mt-3">CONTACT INFORMATION</p>
          <div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700">
            <p className="font-medium">Email id:</p>
            <p className="text-blue-500">{userData.email}</p>

            <p className="font-medium">Phone:</p>
            {isEdit ? (
              <input
                className="bg-gray-100 max-w-52"
                type="text"
                value={userData.phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setUserData((prev) => ({ ...prev, phone: val }));
                }}
                placeholder="10-digit phone number"
                maxLength={10}
              />
            ) : (
              <p className="text-blue-400">{userData.phone || "Not set"}</p>
            )}

            <p className="font-medium">Address:</p>
            {isEdit ? (
              <div>
                <input
                  className="bg-gray-50 w-full"
                  onChange={(e) =>
                    setUserData((prev) => ({
                      ...prev,
                      address: { ...prev.address, line1: e.target.value },
                    }))
                  }
                  value={userData.address.line1}
                  type="text"
                  placeholder="Line 1"
                />
                <br />
                <input
                  className="bg-gray-50 w-full mt-1"
                  onChange={(e) =>
                    setUserData((prev) => ({
                      ...prev,
                      address: { ...prev.address, line2: e.target.value },
                    }))
                  }
                  value={userData.address.line2}
                  type="text"
                  placeholder="Line 2"
                />
              </div>
            ) : (
              <p className="text-gray-500">
                {userData.address.line1 || userData.address.line2 ? (
                  <>
                    {userData.address.line1}
                    {userData.address.line1 && userData.address.line2 && <br />}
                    {userData.address.line2}
                  </>
                ) : (
                  "Not set"
                )}
              </p>
            )}
          </div>
        </div>

        {/* Basic Information */}
        <div>
          <p className="text-neutral-500 underline mt-3">BASIC INFORMATION</p>
          <div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700">
            <p className="font-medium">Gender:</p>
            {isEdit ? (
              <select
                className="max-w-24 bg-gray-100"
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, gender: e.target.value }))
                }
                value={userData.gender}
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            ) : (
              <p className="text-gray-400">
                {userData.gender
                  ? userData.gender.charAt(0).toUpperCase() +
                    userData.gender.slice(1)
                  : "Not set"}
              </p>
            )}

            <p className="font-medium">Birthday:</p>
            {isEdit ? (
              <input
                className="max-w-28 bg-gray-100"
                type="date"
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, dob: e.target.value }))
                }
                value={userData.dob}
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

        {/* Buttons */}
        <div className="mt-10 flex justify-center gap-4">
          {isEdit ? (
            <button
              className="border border-blue-600 text-blue-600 px-8 py-2 rounded-full hover:bg-blue-600 hover:text-white transition-all disabled:opacity-50"
              onClick={updateUserProfileData}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save information"}
            </button>
          ) : (
            <button
              className="border border-blue-600 text-blue-600 px-16 py-2 rounded-full hover:bg-blue-600 hover:text-white transition-all"
              onClick={() => setIsEdit(true)}
            >
              Edit Profile
            </button>
          )}
          {isEdit && (
            <button
              className="border border-gray-500 text-gray-500 px-8 py-2 rounded-full hover:bg-gray-500 hover:text-white transition-all"
              onClick={() => setIsEdit(false)}
            >
              Cancel
            </button>
          )}
        </div>

        <hr className="bg-zinc-400 h-[1px] border-none mt-8" />

        {/* Logout Button */}
        <div className="pt-6 flex justify-center">
          <button
            onClick={handleLogout}
            className="text-red-500 hover:text-red-700 text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
