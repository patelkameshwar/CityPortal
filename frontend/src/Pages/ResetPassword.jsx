import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  // Form State
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('empty');
  const [showStrength, setShowStrength] = useState(false);
  
  // Status State
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [validToken, setValidToken] = useState(null);

  // Derived State for Validation
  const isMatching = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;

  const isStrong = (pwd) => {
    if (pwd.length < 8) return false;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasDigit = /\d/.test(pwd);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    return hasUpper && hasLower && hasDigit && hasSpecial;
  };

  const getStrength = (pwd) => {
    if (pwd.length === 0) return 'empty';
    if (pwd.length < 6) return 'weak';
    if (isStrong(pwd)) return 'strong';
    return 'medium';
  };

  useEffect(() => {
    const verifyToken = async () => {
      try {
        // GET request to verify if token is still valid/not expired
        await api.get(`/auth/reset-password/${token}`);
        setValidToken(true);
      } catch (error) {
        setValidToken(false);
      } finally {
        setVerifying(false);
      }
    };
    verifyToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (!isStrong(password)) {
      return toast.error('Password must be strong: Min 8 chars, uppercase, lowercase, number, and special character (!@#$%^&*)');
    }

    setLoading(true);
    try {
      await api.put(`/auth/reset-password/${token}`, { password });
      toast.success('Password updated! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2500);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  // --- 1. Loading Screen (Initial verification) ---
  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
          <p className="text-slate-500 font-medium">Verifying security link...</p>
        </div>
      </div>
    );
  }

  // --- 2. Error Screen (Expired/Invalid Token) ---
  if (validToken === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-100 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Link Expired</h2>
          <p className="mt-2 text-slate-600 mb-8 leading-relaxed">
            For your security, password reset links are only valid for a short time. Please request a new one.
          </p>
          <button
            onClick={() => navigate('/forgot-password')}
            className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Forgot Password
          </button>
        </div>
      </div>
    );
  }

  // --- 3. Main Form (Successful Token) ---
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Reset Password</h2>
          <p className="text-slate-500 mt-1">Please create a new, strong password.</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* New Password Field */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => {
                  const val = e.target.value;
                  setPassword(val);
                  setPasswordStrength(getStrength(val));
                  setShowStrength(val.length > 0);
                }}
                className={`block w-full pl-10 pr-10 py-3 border rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all placeholder:text-slate-400 ${
                  passwordStrength === 'strong' 
                    ? 'border-emerald-300 ring-2 ring-emerald-200/50 bg-emerald-50/30' 
                    : passwordStrength === 'medium'
                    ? 'border-yellow-200 ring-2 ring-yellow-200/50 bg-yellow-50/20'
                    : passwordStrength === 'weak'
                    ? 'border-red-200 ring-2 ring-red-200/50 bg-red-50/20'
                    : 'border-slate-200 focus:ring-indigo-500'
                }`}
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                {/* ICON DYNAMICS: Turns green on match */}
                <CheckCircle2 
                  className={`h-4 w-4 transition-all duration-300 transform ${
                    isMatching 
                      ? 'text-emerald-500 scale-110 shadow-emerald-100' 
                      : 'text-slate-400'
                  }`} 
                />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`block w-full pl-10 py-3 border rounded-xl focus:ring-2 outline-none transition-all placeholder:text-slate-400 ${
                  isMatching 
                    ? 'border-emerald-200 bg-emerald-50/10 focus:ring-emerald-500' 
                    : 'border-slate-200 focus:ring-indigo-500'
                }`}
                placeholder="Repeat new password"
              />
            </div>
          </div>

          {/* Password Strength Indicator */}
          {showStrength && (
            <div className="pt-3 space-y-2">
              {/* Strength Progress Bar */}
              <div className="flex rounded-full h-2 bg-slate-200 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 rounded-full ${
                    passwordStrength === 'strong' ? 'bg-emerald-500 w-[100%]' :
                    passwordStrength === 'medium' ? 'bg-yellow-500 w-[60%]' :
                    passwordStrength === 'weak' ? 'bg-red-500 w-[30%]' :
                    'bg-slate-300 w-0'
                  }`}
                />
              </div>
              <div className="flex text-xs space-x-2 text-slate-600">
                <span className={`font-medium ${passwordStrength === 'strong' ? 'text-emerald-600' : 'text-slate-500'}`}>
                  {passwordStrength === 'strong' ? 'Strong' : passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}
                </span>
              </div>
              {/* Criteria Checkmarks */}
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div className={`flex items-center gap-1 ${/[A-Z]/.test(password) ? 'text-emerald-600' : 'text-slate-400'}`}>
                  <CheckCircle2 className={`w-3 h-3 ${/[A-Z]/.test(password) ? '' : 'opacity-50'}`} /> Uppercase
                </div>
                <div className={`flex items-center gap-1 ${/[a-z]/.test(password) ? 'text-emerald-600' : 'text-slate-400'}`}>
                  <CheckCircle2 className={`w-3 h-3 ${/[a-z]/.test(password) ? '' : 'opacity-50'}`} /> Lowercase
                </div>
                <div className={`flex items-center gap-1 ${/\d/.test(password) ? 'text-emerald-600' : 'text-slate-400'}`}>
                  <CheckCircle2 className={`w-3 h-3 ${/\d/.test(password) ? '' : 'opacity-50'}`} /> Number
                </div>
                <div className={`flex items-center gap-1 ${/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-emerald-600' : 'text-slate-400'}`}>
                  <CheckCircle2 className={`w-3 h-3 ${/[!@#$%^&*(),.?":{}|<>]/.test(password) ? '' : 'opacity-50'}`} /> Special Char
                </div>
              </div>
            </div>
          )}
          {/* Password Requirements hint */}
          <p className="text-xs text-slate-400 px-1 mt-2">
            Min 8 chars: Uppercase, lowercase, number, special char (!@#$%^&*)
          </p>

          <button
            type="submit"
            disabled={loading || !isMatching || !isStrong(password)}
            className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-md shadow-indigo-100 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Processing...
              </>
            ) : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;