import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { FaUser, FaLock, FaEnvelope, FaEye, FaEyeSlash, FaToggleOff, FaToggleOn } from 'react-icons/fa';

const Login = () => {
  const [role, setRole] = useState('admin');
  const location = useLocation();
  const defaultRole = location.state?.role || 'admin';
  useEffect(() => {
    setRole(defaultRole);
  }, [defaultRole]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleRoleToggle = () => {
    setRole(role === 'admin' ? 'client' : 'admin');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, role }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('Login successful!');
        navigate(role === 'admin' ? '/admin-dashboard' : '/dashboard');
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (err) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8 border">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {role === 'admin' ? 'Admin Login' : 'Client Login'}
          </h2>
          <p className="text-gray-600">Sign in as {role} </p>
        </div>

        {/* Role Toggle */}
        <div className="flex justify-center mb-6 p-3 bg-gray-200 rounded-lg">
          <button
            type="button"
            onClick={handleRoleToggle}
            className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gray-100 shadow-md transition-all duration-200 hover:shadow-lg"
          >
            {role === 'admin' ? (
              <>
                <FaToggleOn className="text-green-500" />
                <span className="font-medium text-green-600">Admin</span>
              </>
            ) : (
              <>
                <FaToggleOff className="text-gray-400" />
                <span className="font-medium text-gray-500">Admin</span>
              </>
            )}
            <span className="mx-2">/</span>
            {role === 'client' ? (
              <>
                <FaToggleOn className="text-blue-500" />
                <span className="font-medium text-blue-600">Client</span>
              </>
            ) : (
              <>
                <FaToggleOff className="text-gray-400" />
                <span className="font-medium text-gray-500">Client</span>
              </>
            )}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-600">Remember me</span>
            </label>
            <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <ToastContainer position="top-right" theme="colored" />
        </div>

{role === 'client' && (
          <p className="mt-8 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
              Create Account
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;


