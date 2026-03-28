import React, { useState } from "react";
import { assets } from "../assets/assets";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiMenu, FiX, FiUser, FiLogOut, FiCalendar } from "react-icons/fi";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex items-center justify-between text-sm py-4 mb-5 border-b border-b-gray-600">
      <img
        className="w-30 h-9 cursor-pointer"
        src={assets.logo2}
        alt="CityPortal"
        onClick={() => navigate("/")}
      />

      <ul className="hidden md:flex items-start gap-5 font-medium text-base">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `py-1 hover:text-blue-600 transition ${isActive ? "text-blue-600 border-b-2 border-blue-600" : ""}`
          }
        >
          <li>Home</li>
        </NavLink>
        <NavLink
          to="/hotels"
          className={({ isActive }) =>
            `py-1 hover:text-blue-600 transition ${isActive ? "text-blue-600 border-b-2 border-blue-600" : ""}`
          }
        >
          <li>Hotels</li>
        </NavLink>
        <NavLink
          to="/events"
          className={({ isActive }) =>
            `py-1 hover:text-blue-600 transition ${isActive ? "text-blue-600 border-b-2 border-blue-600" : ""}`
          }
        >
          <li>Events</li>
        </NavLink>
        <NavLink
          to="/tourism"
          className={({ isActive }) =>
            `py-1 hover:text-blue-600 transition ${isActive ? "text-blue-600 border-b-2 border-blue-600" : ""}`
          }
        >
          <li>Tourism</li>
        </NavLink>
        <NavLink
          to="/blogs"
          className={({ isActive }) =>
            `py-1 hover:text-blue-600 transition ${isActive ? "text-blue-600 border-b-2 border-blue-600" : ""}`
          }
        >
          <li>Blogs</li>
        </NavLink>
        <NavLink
          to="/about"
          className={({ isActive }) =>
            `py-1 hover:text-blue-600 transition ${isActive ? "text-blue-600 border-b-2 border-blue-600" : ""}`
          }
        >
          <li>About</li>
        </NavLink>
        <NavLink
          to="/contact"
          className={({ isActive }) =>
            `py-1 hover:text-blue-600 transition ${isActive ? "text-blue-600 border-b-2 border-blue-600" : ""}`
          }
        >
          <li>Contact</li>
        </NavLink>
      </ul>

      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <div
            className="flex items-center gap-2 cursor-pointer relative"
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
          >
            {/* Profile Avatar */}
            <div className="flex items-center gap-2">
              {user?.profilePicture ? (
                <img
                  className="w-9 h-9 rounded-full border-2 border-white shadow-md object-cover"
                  src={user.profilePicture}
                  alt="Profile"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center border-2 border-white shadow-md">
                  <FiUser className="h-4 w-4 text-white" />
                </div>
              )}
              <img
                className={`w-2.5 transition-transform duration-300 ${showDropdown ? "rotate-180" : ""}`}
                src={assets.dropdown}
                alt=""
              />
            </div>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute top-full right-0 pt-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="min-w-52 bg-white rounded-xl shadow-xl border border-gray-100 flex flex-col p-2 overflow-hidden">
                  <button
                    onClick={() => {
                      navigate("/my-profile");
                      setShowDropdown(false);
                    }}
                    className="hover:bg-blue-50 hover:text-blue-600 px-4 py-2.5 rounded-lg cursor-pointer flex items-center gap-3 transition-colors text-sm font-medium text-gray-700"
                  >
                    <FiUser className="text-gray-400" size={16} /> My Profile
                  </button>

                  <button
                    onClick={() => {
                      navigate("/my-bookings");
                      setShowDropdown(false);
                    }}
                    className="hover:bg-blue-50 hover:text-blue-600 px-4 py-2.5 rounded-lg cursor-pointer flex items-center gap-3 transition-colors text-sm font-medium text-gray-700"
                  >
                    <FiCalendar className="text-gray-400" size={16} /> My
                    Bookings
                  </button>

                  <hr className="my-1 border-gray-200" />

                  <button
                    onClick={() => {
                      handleLogout();
                      setShowDropdown(false);
                    }}
                    className="hover:bg-red-50 hover:text-red-600 px-4 py-2.5 rounded-lg cursor-pointer flex items-center gap-3 transition-colors text-sm font-medium text-red-500"
                  >
                    <FiLogOut size={16} /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="bg-gray-900 text-white px-8 py-2.5 rounded-full font-medium hidden md:block hover:bg-black transition-all shadow-md active:scale-95"
          >
            Login
          </button>
        )}

        <button className="md:hidden" onClick={() => setShowMenu(!showMenu)}>
          {showMenu ? (
            <FiX className="w-6 h-6" />
          ) : (
            <FiMenu className="w-6 h-6" />
          )}
        </button>
      </div>

      {showMenu && (
        <div className="fixed top-0 left-0 w-full h-full bg-white z-50 p-4 md:hidden">
          <div className="flex justify-between items-center mb-4">
            <img className="w-30 h-9" src={assets.logo2} alt="" />
            <button onClick={() => setShowMenu(false)}>
              <FiX className="w-6 h-6" />
            </button>
          </div>
          <ul className="flex flex-col gap-4 font-medium">
            <NavLink to="/" onClick={() => setShowMenu(false)}>
              Home
            </NavLink>
            <NavLink to="/hotels" onClick={() => setShowMenu(false)}>
              Hotels
            </NavLink>
            <NavLink to="/events" onClick={() => setShowMenu(false)}>
              Events
            </NavLink>
            <NavLink to="/tourism" onClick={() => setShowMenu(false)}>
              Tourism
            </NavLink>
            <NavLink to="/blogs" onClick={() => setShowMenu(false)}>
              Blogs
            </NavLink>
            <NavLink to="/about" onClick={() => setShowMenu(false)}>
              About
            </NavLink>
            <NavLink to="/contact" onClick={() => setShowMenu(false)}>
              Contact
            </NavLink>
            {!isAuthenticated && (
              <NavLink to="/login" onClick={() => setShowMenu(false)}>
                Login
              </NavLink>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Navbar;
