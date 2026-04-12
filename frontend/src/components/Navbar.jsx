import React, { useState, useEffect } from "react";
import { assets } from "../assets/assets";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiMenu, FiX, FiUser, FiLogOut, FiCalendar } from "react-icons/fi";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const [showMenu, setShowMenu] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileDropdown, setShowMobileDropdown] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setShowMenu(false);
    setShowMobileDropdown(false);
  }, [location.pathname]);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = showMenu ? "hidden" : "auto";
  }, [showMenu]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      <div
        className={`w-full sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/60 backdrop-blur-lg border-b border-gray-200/50 shadow-[0_2px_10px_rgba(0,0,0,0.05)]"
            : "bg-white border-b border-gray-200 shadow-sm"
        }`}
      >
        <div
          className={`flex items-center justify-between px-4 md:px-8 lg:px-16 mx-4 sm:mx-[10%] transition-all duration-300 ${
            isScrolled ? "py-2" : "py-4"
          }`}
        >
          {/* LOGO */}
          <img
            className={`h-auto cursor-pointer transition-all duration-300 ${
              isScrolled ? "w-24" : "w-28 sm:w-32 md:w-36"
            }`}
            src={assets.logo2}
            alt="cityPortal"
            onClick={() => navigate("/")}
          />

          <ul className="hidden md:flex items-center gap-6 lg:gap-8 font-medium text-gray-700">
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

          {/* RIGHT SECTION */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div
                className="hidden md:flex relative items-center gap-2 cursor-pointer"
                onMouseEnter={() => {
                  if (hoverTimeout) clearTimeout(hoverTimeout);
                  setShowDropdown(true);
                }}
                onMouseLeave={() => {
                  const timeout = setTimeout(() => setShowDropdown(false), 200);
                  setHoverTimeout(timeout);
                }}
              >
                <div className="flex items-center gap-2">
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      className="w-9 h-9 rounded-full border-2 border-white shadow-md object-cover"
                      alt="profilepic"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center border-2 border-white shadow-md">
                      <FiUser className="h-4 w-4 text-white" />
                    </div>
                  )}

                  <img
                    className={`w-2.5 transition-transform duration-300 ${
                      showDropdown ? "rotate-180" : ""
                    }`}
                    src={assets.dropdown}
                    alt=""
                  />
                </div>

                {showDropdown && (
                  <div
                    className="absolute right-0 top-full mt-2 bg-white shadow-lg rounded-xl w-52"
                    onMouseEnter={() => {
                      if (hoverTimeout) clearTimeout(hoverTimeout);
                    }}
                    onMouseLeave={() => {
                      const timeout = setTimeout(() => {
                        setShowDropdown(false);
                      }, 200);
                      setHoverTimeout(timeout);
                    }}
                  >
                    <div className="flex flex-col p-2">
                      <button
                        onClick={() => {
                          navigate("/my-profile");
                          setShowDropdown(false);
                        }}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50 rounded-lg"
                      >
                        <FiUser />
                        My Profile
                      </button>

                      <button
                        onClick={() => {
                          navigate("/my-bookings");
                          setShowDropdown(false);
                        }}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50 rounded-lg"
                      >
                        <FiCalendar /> My Bookings
                      </button>

                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2 border-t border-red-200 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <FiLogOut /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="hidden md:block bg-blue-600 text-white px-8 py-2 rounded-full font-medium hover:bg-blue-700 transition-all shadow-sm"
              >
                Login
              </button>
            )}

            {/* MOBILE MENU BUTTON */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
              onClick={() => setShowMenu(!showMenu)}
            >
              {showMenu ? (
                <FiX className="w-6 h-6" />
              ) : (
                <FiMenu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ✅ MOBILE MENU */}
      {showMenu && (
        <div className="fixed inset-0 z-[999] bg-white flex flex-col md:hidden">
          {/* HEADER */}
          <div className="flex justify-between items-center px-4 py-4 border-b border-gray-400">
            <img className="w-28" src={assets.logo2} alt="" />
            <button onClick={() => setShowMenu(false)}>
              <FiX size={26} />
            </button>
          </div>

          {/* MENU */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <ul className="flex flex-col gap-6 text-md font-medium text-gray-800">
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
            </ul>
          </div>

          {/* FOOTER */}
          <div className="px-4 py-4 border-t border-gray-400 relative">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => setShowMobileDropdown(!showMobileDropdown)}
                  className="w-full flex items-center justify-between px-3 py-3 rounded-lg bg-gray-200 hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-3">
                    {user?.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        className="w-9 h-9 rounded-full object-cover border"
                        alt="profile"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white">
                        <FiUser />
                      </div>
                    )}

                    <span className="font-bold text-gray-800">
                      {user?.name ? user.name : "Account"}
                    </span>
                  </div>

                  <span
                    className={`transition ${showMobileDropdown ? "rotate-180" : ""}`}
                  >
                    ▼
                  </span>
                </button>

                {showMobileDropdown && (
                  <div className="absolute bottom-full left-0 w-full mb-2 bg-white rounded-xl shadow-lg border p-3 flex flex-col gap-3">
                    <button
                      onClick={() => {
                        navigate("/my-profile");
                        setShowMenu(false);
                        setShowMobileDropdown(false);
                      }}
                      className="flex items-center gap-3 text-gray-700 hover:text-blue-600"
                    >
                      <FiUser size={18} /> My Profile
                    </button>

                    <button
                      onClick={() => {
                        navigate("/my-bookings");
                        setShowMenu(false);
                        setShowMobileDropdown(false);
                      }}
                      className="flex items-center gap-3 text-gray-700 hover:text-blue-600"
                    >
                      <FiCalendar size={18} /> My Bookings
                    </button>

                    <button
                      onClick={() => {
                        handleLogout();
                        setShowMenu(false);
                        setShowMobileDropdown(false);
                      }}
                      className="flex items-center gap-3 text-red-500 hover:text-red-600"
                    >
                      <FiLogOut size={18} /> Logout
                    </button>
                  </div>
                )}
              </>
            ) : (
              <button
                onClick={() => {
                  navigate("/login");
                  setShowMenu(false);
                }}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Login
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
