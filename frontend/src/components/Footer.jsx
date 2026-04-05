import React from 'react';
import { FiMapPin, FiPhone, FiMail, FiFacebook, FiTwitter, FiInstagram } from 'react-icons/fi';
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-300 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">CityPortal</h3>
            <p className="text-gray-600 text-sm">
              Your ultimate destination for booking hotels, events, and tourism spots. 
              We make it easy to find and book the best places in the city.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/hotels" className="text-gray-600 hover:text-blue-600 transition">Hotels</Link></li>
              <li><Link to="/events" className="text-gray-600 hover:text-blue-600 transition">Events</Link></li>
              <li><Link to="/tourism" className="text-gray-600 hover:text-blue-600 transition">Tourism</Link></li>
              <li><Link to="/about" className="text-gray-600 hover:text-blue-600 transition">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-600 hover:text-blue-600 transition">Contact</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-gray-600">
                <FiMapPin className="h-4 w-4" />
                <span>Udaipur, Rajasthan</span>
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <FiPhone className="h-4 w-4" />
                <span>+91 986 5672 890</span>
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <FiMail className="h-4 w-4" />
                <span>contact@cityportal.com</span>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="bg-gray-200 p-2 rounded-full hover:bg-blue-600 hover:text-white transition">
                <FiFacebook className="h-5 w-5" />
              </a>
              <a href="#" className="bg-gray-200 p-2 rounded-full hover:bg-black hover:text-white transition">
                <FiTwitter className="h-5 w-5" />
              </a>
              <a href="#" className="bg-gray-200 p-2 rounded-full hover:bg-pink-600 hover:text-white transition">
                <FiInstagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-300 mt-8 pt-8 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} CityPortal. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
