import React from "react";
import { Link } from "react-router-dom";

function ForgotPassword() {
  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Left side (optional content / image) */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-12">
        {/* Add image or info text if needed */}
      </div>

      {/* Right side form */}
      <div className="flex-1 flex items-center justify-start lg:justify-center p-8">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
          {/* Title */}
          <div className="mb-4 text-center">
            <h2 className="text-3xl font-semibold text-gray-900">
              Forgot Password
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              Enter your email and we’ll send you a reset link
            </p>
          </div>

          {/* Form */}
          <form className="space-y-4">
            <input
              type="email"
              placeholder="Email Address"
              required
              className="w-full p-3 border-b-2 border-gray-300 outline-none focus:border-blue-500 placeholder-gray-400"
            />

            <button className="w-full p-3 bg-blue-500 text-white rounded-full text-lg font-medium hover:opacity-90 transition">
              Send Reset Link
            </button>

            {/* Back to login */}
            <p className="text-center text-gray-600">
              Remember your password?{" "}
              <Link to="/login" className="text-blue-600 hover:underline">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
