import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import ScrollToTop from "./components/ScrollToTop";

import Home from "./pages/Home";
import Hotels from "./pages/Hotels";
import Events from "./pages/Events";
import Tourism from "./pages/Tourism";
import Blogs from "./pages/Blogs";
import About from "./pages/About";
import Contact from "./pages/Contact";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import UpdatePassword from "./pages/UpdatePassword";

const App = () => {
  const [user, setUser] = React.useState(null);

  return (
    <Router>
      <ScrollToTop />
      <Navbar user={user} setUser={setUser} />

      <Routes>
        {/* Auth */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/update-password" element={<UpdatePassword />} />

        {/* SPA Pages */}
        <Route path="/home" element={<Home />} />
        <Route path="/hotels" element={<Hotels />} />
        <Route path="/events" element={<Events />} />
        <Route path="/tourism" element={<Tourism />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </Router>
  );
};

export default App;
