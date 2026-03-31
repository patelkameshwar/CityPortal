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
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showHints, setShowHints] = useState(false);
  
  // Status State
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [validToken, setValidToken] = useState(null);

  // Derived State for Validation
  const isStrong = (pwd) => {
    if (pwd.length < 8) return false;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasDigit = /\d/.test(pwd);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    return hasUpper && hasLower && hasDigit && hasSpecial;
  };

  const isMatching = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;

  useEffect(() => {
    const verifyToken = async () => {
      try {
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
    if (!isMatching) return toast.error('Passwords do not match');
    if (!isStrong(password)) return toast.error('Password does not meet requirements');

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

  if (validToken === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-100 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Link Expired</h2>
          <p className="mt-2 text-slate-600 mb-8 leading-relaxed">
            For your security, password reset links are only valid for a short time.
          </p>
          <button
            onClick={() => navigate('/forgot-password')}
            className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Request New Link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900">New Password</h2>
          <p className="text-slate-500 mt-1 text-sm">Secure your account with a fresh password.</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Password Input */}
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
                  setPassword(e.target.value);
                  setShowHints(e.target.value.length > 0);
                }}
                className={`block w-full pl-10 pr-10 py-3 border rounded-xl outline-none transition-all placeholder:text-slate-400 ${
                  isStrong(password)
                    ? 'border-emerald-500 ring-2 ring-emerald-100 bg-emerald-50/20'
                    : 'border-slate-200 focus:ring-2 focus:ring-indigo-500'
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* "Blueprint" Hint */}
            {showHints && !isStrong(password) && (
              <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200 animate-in fade-in slide-in-from-top-1">
                <p className="text-xs text-slate-600 flex items-center gap-2">
                  <AlertCircle className="text-amber-500 shrink-0 w-3.5 h-3.5" />
                  Password must be at least 8 characters and include an uppercase letter, a digit, and a special character.
                </p>
                <p className="text-[11px] text-slate-400 mt-2 italic">
                  Example: <span className="font-mono select-none">Secure@2026</span>
                </p>
              </div>
            )}

            {isStrong(password) && (
              <div className="mt-2 flex items-center gap-1.5 text-emerald-600 animate-in zoom-in duration-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="text-xs font-bold">Strong password ✓</span>
              </div>
            )}
          </div>

          {/* Confirm Password Input */}
          <div className="mt-5">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <CheckCircle2 
                  className={`h-4 w-4 transition-all duration-300 ${
                    isMatching ? 'text-emerald-500 scale-110' : 'text-slate-400'
                  }`} 
                />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`block w-full pl-10 pr-10 py-3 border rounded-xl outline-none transition-all placeholder:text-slate-400 ${
                  isMatching 
                    ? 'border-emerald-500 ring-2 ring-emerald-100 bg-emerald-50/20' 
                    : 'border-slate-200 focus:ring-2 focus:ring-indigo-500'
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {isMatching && (
              <div className="mt-2 flex items-center gap-1.5 text-emerald-600 animate-in slide-in-from-left-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="text-xs font-bold">Passwords matched ✓</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !isMatching || !isStrong(password)}
            className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-4"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Updating...
              </>
            ) : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;