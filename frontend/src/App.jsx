import React from "react";
import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ToastContainer } from "react-toastify";

// Pages
import Home from "./pages/Home";
import Hotels from "./pages/Hotels";
import HotelDetails from "./pages/HotelDetails";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import Tourism from "./pages/Tourism";
import TourismDetails from "./pages/TourismDetails";
import Blogs from "./pages/Blogs";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyProfile from "./pages/MyProfile";
import MyBookings from "./pages/MyBookings";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const App = () => {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <ToastContainer position="top-right" autoClose={3000} />

          {/* Pages */}
          <div className="grow mx-4 sm:mx-[10%]">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/hotels" element={<Hotels />} />
              <Route path="/hotels/:id" element={<HotelDetails />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:id" element={<EventDetails />} />
              <Route path="/tourism" element={<Tourism />} />
              <Route path="/tourism/:id" element={<TourismDetails />} />
              <Route path="/blogs" element={<Blogs />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/my-profile" element={<MyProfile />} />
              <Route path="/my-bookings" element={<MyBookings />} />
            </Routes>
          </div>

          <div className="mx-4 sm:mx-[10%]">
            <Footer />
          </div>
        </div>

      </AuthProvider>
    </GoogleOAuthProvider>
  );
};

export default App;