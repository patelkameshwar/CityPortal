import React, { useState } from "react";
import { Link } from "react-router-dom";

function UpdatePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert("New passwords do not match");
      return;
    }

    // 🔌 API call here
    console.log({
      currentPassword,
      newPassword,
    });
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      
      <div className="hidden lg:flex flex-1 items-center justify-center p-12">
        {/* Add image / content */}
      </div>

      <div className="flex-1 flex items-center justify-start lg:justify-center p-8">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
          
          <div className="mb-4 text-center">
            <h2 className="text-3xl font-semibold text-gray-900">
              Update Password
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              Change your account password
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              placeholder="Current Password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full p-3 border-b-2 border-gray-300 outline-none focus:border-blue-500 placeholder-gray-400"
            />

            <input
              type="password"
              placeholder="New Password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 border-b-2 border-gray-300 outline-none focus:border-blue-500 placeholder-gray-400"
            />

            <input
              type="password"
              placeholder="Confirm New Password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 border-b-2 border-gray-300 outline-none focus:border-blue-500 placeholder-gray-400"
            />

            <button className="w-full p-3 bg-blue-500 text-white rounded-full text-lg font-medium hover:opacity-90 transition">
              Update Password
            </button>

            <p className="text-center text-gray-600">
              Back to{" "}
              <Link to="/profile" className="text-blue-600 hover:underline">
                Profile
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UpdatePassword;
