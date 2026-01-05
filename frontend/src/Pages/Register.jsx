import React from "react";
import { Link } from "react-router-dom";

function Register() {
  return (
    <div className="min-h-screen flex bg-gray-100">
      
      <div className="hidden lg:flex flex-1 items-center justify-center p-12">
        {/* You can add image or text here */}
      </div>

      <div className="flex-1 flex items-center justify-start lg:justify-center p-8">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">

          <div className="flex justify-center mb-4">
            <h2 className="text-3xl font-semibold text-center text-gray-900">
              Sign Up
            </h2>
          </div>

          <form className="space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              required
              className="w-full p-3 border-b-2 border-gray-300 outline-none focus:border-blue-500 placeholder-gray-400"
            />

            <input
              type="email"
              placeholder="Email Address"
              required
              className="w-full p-3 border-b-2 border-gray-300 outline-none focus:border-blue-500 placeholder-gray-400"
            />

            <input
              type="password"
              placeholder="Password"
              required
              className="w-full p-3 border-b-2 border-gray-300 outline-none focus:border-blue-500 placeholder-gray-400"
            />

            <input
              type="password"
              placeholder="Confirm Password"
              required
              className="w-full p-3 border-b-2 border-gray-300 outline-none focus:border-blue-500 placeholder-gray-400"
            />

            <button className="w-full p-3 bg-blue-500 text-white rounded-full text-lg font-medium hover:opacity-90 transition">
              Create Account
            </button>

            <p className="text-center text-gray-600">
              Already have an account?{" "}
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

export default Register;
