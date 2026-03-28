import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check sessionStorage first, then localStorage
    const sessionToken = sessionStorage.getItem('token');
    const localToken = localStorage.getItem('token');
    const tokenToUse = sessionToken || localToken;
    const storedUser = (sessionToken ? sessionStorage : localStorage).getItem('user');
    
    if (storedUser && tokenToUse) {
      setUser(JSON.parse(storedUser));
      if (!token) setToken(tokenToUse); // Only set if not already set
    }
    setLoading(false);
  }, []); // Remove token dep to run once

const login = (userData, authToken, rememberMe = true) => {
    const storage = rememberMe ? localStorage : sessionStorage;
    setUser(userData);
    setToken(authToken);
    storage.setItem('token', authToken);
    storage.setItem('user', JSON.stringify(userData));
  };

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
    // Update both storages to keep in sync
    localStorage.setItem('user', JSON.stringify(updatedUserData));
    sessionStorage.setItem('user', JSON.stringify(updatedUserData));
  };

  const logout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

