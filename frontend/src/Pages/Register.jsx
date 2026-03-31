import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../services/api";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("empty");
  const [showHints, setShowHints] = useState(false);
  const [loading, setLoading] = useState(false);

  // Password strength logic from ResetPassword
  const isStrong = (pwd) => {
    if (pwd.length < 8) return false;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasDigit = /\d/.test(pwd);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    return hasUpper && hasLower && hasDigit && hasSpecial;
  };

  const getStrength = (pwd) => {
    if (pwd.length === 0) return "empty";
    if (pwd.length < 6) return "weak";
    if (isStrong(pwd)) return "strong";
    return "medium";
  };

  const isMatching =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    password === confirmPassword;

  // Optional: check if the password is both matching AND strong
  const isFullyValid = isMatching && isStrong(password);

  // Get missing criteria for hints
  const getMissingHints = (pwd) => {
    const hints = [];
    if (pwd.length < 8) hints.push("Password must be at least 8 characters");
    if (!/[A-Z]/.test(pwd))
      hints.push("Include at least one uppercase letter (A-Z)");
    if (!/[a-z]/.test(pwd))
      hints.push("Include at least one lowercase letter (a-z)");
    if (!/\d/.test(pwd)) hints.push("Include at least one number (0-9)");
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd))
      hints.push(
        'Include at least one special character (!@#$%^&*(),.?":{}|<>)',
      );
    return hints;
  };
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Error handling moved to toast

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!isStrong(password)) {
      toast.error(
        "Password must meet strength requirements: Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char",
      );
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.register({
        name,
        email,
        password,
        role: "user",
      });
      if (response.data.user) {
        // Auto login after registration
        login(response.data.user, response.data.token);
        toast.success("Registration successful! Welcome to CityPortal!");
        navigate("/");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Create Account</h2>
          <p className="text-gray-600 mt-2">Join CityPortal today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="text-gray-400" />
              </div>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="text-gray-400" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  const val = e.target.value;
                  setPassword(val);
                  const strength = getStrength(val);
                  setPasswordStrength(strength);
                  setShowHints(val.length > 0);
                }}
                required
                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                  passwordStrength === "strong"
                    ? "border-emerald-300 ring-emerald-200/50 bg-emerald-50/30"
                    : passwordStrength === "medium"
                      ? "border-gray-300 ring-gray-200/50"
                      : passwordStrength === "weak" ||
                          passwordStrength === "empty"
                        ? "border-gray-300 ring-gray-200/50"
                        : "border-gray-300"
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {/* Password Hints - Only unmet criteria */}
            {showHints && !isStrong(password) && (
              <div className="pt-2 pb-4 space-y-1">
                <p className="text-xs font-medium text-red-600 mb-2">
                  Password requirements not met:
                </p>
                <div className="grid grid-cols-1 gap-1 text-xs text-red-500">
                  {getMissingHints(password).map((hint, index) => (
                    <div key={index} className="flex items-center gap-1">
                      <FaExclamationTriangle className="w-3 h-3 shrink-0" />
                      <span>{hint}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showHints && isStrong(password) && (
              <div className="pt-2 pb-4">
                <p className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                  <FaCheckCircle className="w-4 h-4" />
                  Strong password ✓
                </p>
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                  isMatching
                    ? "border-emerald-300 focus:ring-emerald-500 bg-emerald-50/30"
                    : "border-gray-300"
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {isMatching && (
              <div className="pt-2 pb-4">
                <p className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                  <FaCheckCircle className="w-4 h-4" />
                  {isStrong(password)
                    ? "password matched ✓"
                    : "Passwords not match"}
                </p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={
              loading || password === "" || !isMatching || !isStrong(password)
            }
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
