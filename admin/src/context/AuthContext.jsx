import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api.js";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [rememberMe, setRememberMe] = useState(
    localStorage.getItem("rememberMe") === "true",
  );

  useEffect(() => {
    let token;
    if (localStorage.getItem("rememberMe") === "true") {
      token = localStorage.getItem("token");
    } else {
      token = sessionStorage.getItem("token");
    }
    if (token) {
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  setIsAuthenticated(true); // ✅ ADD THIS
  verifyToken(token);
} else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      const response = await api.get("/auth/profile");
      setUser(response.data.user || response.data);
      setIsAuthenticated(true);
    } catch (error) {
  if (error.response?.status === 401) {
    logout();
  } else {
    toast.error("Server error. Please try again.");
  }
} finally {
      setLoading(false);
    }
  };

  const login = async (email, password, role, rememberMe) => {
    try {
      const response = await api.post("/auth/login", { email, password, role });
      const { token, user } = response.data;

      setRememberMe(rememberMe);
      localStorage.setItem("rememberMe", rememberMe.toString());

      localStorage.removeItem("token");
      sessionStorage.removeItem("token");

      if (rememberMe) {
        localStorage.setItem("token", token);
      } else {
        sessionStorage.setItem("token", token);
      }

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(user);
      setIsAuthenticated(true);
      toast.success("Login successful!");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
      return false;
    }
  };

  const register = async (data) => {
    try {
      const response = await api.post("/auth/register", data);
      const { token, user } = response.data;

      localStorage.setItem("token", token);

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(user);
      setIsAuthenticated(true);
      toast.success("Registration successful!");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
      return false;
    }
  };

  const logout = () => {
    toast.dismiss();
    localStorage.removeItem("token");
    localStorage.removeItem("rememberMe");
    sessionStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
    setIsAuthenticated(false);
    setRememberMe(false);
    toast.success("Logged out successfully");
  };

  const updateProfile = async (data) => {
    try {
      const response = await api.put("/auth/profile", data);
      setUser(response.data.user || response.data);
      toast.success("Profile updated");
    } catch (error) {
      toast.error("Update failed");
      throw error;
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateProfile,
    updateUser,
    isAuthenticated,
    loading,
    rememberMe,
    setRememberMe,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
