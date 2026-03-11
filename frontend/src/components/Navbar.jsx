import { NavLink, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

function Navbar({ user, setUser }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    setUser(null);
    navigate("/login");
  };

  // SPA navigation links
  const navLinks = [
    "/home",
    "/hotels",
    "/events",
    "/tourism",
    "/blogs",
    "/about",
    "/contact",
  ];

  return (
    <nav className="w-full bg-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-6 border-b border-gray-200">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <NavLink
            to="/home"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="text-2xl font-bold text-blue-600"
          >
            CityPortal
          </NavLink>

          {/* Center Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((path) => {
              const label =
                path === "/home"
                  ? "Home"
                  : path.slice(1).charAt(0).toUpperCase() + path.slice(2);

              return (
                <NavLink
                  key={path}
                  to={path}
                  onClick={() =>
                    path === "/home" &&
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                  className={({ isActive }) =>
                    `font-medium text-gray-700 hover:text-blue-600 ${
                      isActive
                        ? "underline underline-offset-4 decoration-blue-600"
                        : ""
                    }`
                  }
                >
                  {label}
                </NavLink>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="relative" ref={dropdownRef}>
            {user ? (
              <>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="focus:outline-none"
                >
                  <img
                    src={user.profilePic || "https://i.pravatar.cc/40"}
                    alt="Profile"
                    className="w-10 h-10 rounded-full border"
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50">
                    <NavLink
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      My Profile
                    </NavLink>
                    <NavLink
                      to="/bookings"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      My Bookings
                    </NavLink>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </>
            ) : (
              <button
                onClick={() => navigate("/register")}
                className="px-4 py-2 rounded-full border text-gray-700 hover:bg-gray-100"
              >
                Create Account
              </button>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}

export default Navbar;
