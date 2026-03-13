import React from 'react'

import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
<Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<div className="p-8 text-center text-xl">CityPortal Admin/Client Panel - <a href="/login" className="text-blue-500 hover:underline">Go to Login</a></div>} />
        <Route path="/dashboard" element={<div className="p-8">Dashboard Placeholder (Admin/Client based on login)</div>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

