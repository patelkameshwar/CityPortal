
import React from 'react';
import { FiHome, FiCalendar, FiMapPin } from 'react-icons/fi';

const About = () => {
  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-800 text-center mb-8">About CityPortal</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Welcome to CityPortal</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            CityPortal is your one-stop destination for discovering and booking the best experiences in the city. 
            Whether you're looking for comfortable hotels, exciting events, or amazing tourist attractions, 
            we've got you covered.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Our platform connects travelers and locals with the best services the city has to offer, 
            making it easier than ever to plan your perfect outing.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl mb-4 flex justify-center">
              <FiHome className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Hotels</h3>
            <p className="text-gray-600">Find the perfect accommodation for your stay</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl mb-4 flex justify-center">
              <FiCalendar className="h-12 w-12 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Events</h3>
            <p className="text-gray-600">Discover exciting events happening in the city</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl mb-4 flex justify-center">
              <FiMapPin className="h-12 w-12 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Tourism</h3>
            <p className="text-gray-600">Explore amazing tourist spots and attractions</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our Mission</h2>
          <p className="text-gray-600 leading-relaxed">
            We aim to provide a seamless booking experience for all your city adventures. 
            Our platform is designed to help you discover, compare, and book services 
            with ease, all in one place.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;

