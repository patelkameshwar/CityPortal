import React, { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import { hotelAPI, eventAPI, tourismAPI } from "../services/api";

const TopServices = () => {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [tourism, setTourism] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [hotelsRes, tourismRes, eventsRes] = await Promise.all([
        hotelAPI.getAll(),
        tourismAPI.getAll(),
        eventAPI.getAll(),
      ]);
      setHotels(hotelsRes.data.hotels || []);
      setTourism(tourismRes.data.tourismPlaces || []);
      setEvents(eventsRes.data.events || []);
    } catch (err) {
      toast.error("Failed to load services data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center my-16 text-gray-900 mt-4">
      <h1 className="text-3xl font-medium">Top Services</h1>
      <p className="sm:w-2/3 text-center text-base mt-2">
        Explore our top-rated services across hotels, tourism, and events.
      </p>

      {/* Hotels Row */}
      <div className="w-full pt-5 mt-2">
        <h2 className="text-xl font-medium mb-4 text-gray-700">Top Hotels</h2>
        <div className="w-full flex flex-col lg:flex-row gap-6 items-center">
          <div className="w-full">
            <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 px-3 sm:px-0 auto-rows-fr">
              {hotels.slice(0, 5).map((item, index) => (
                <div
                  key={`hotel-${index}`}
                  onClick={() => {
                    navigate(`/hotels/${item._id}`);
                    window.scrollTo(0, 0);
                  }}
                  className="border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:-translate-y-2.5 transition-all duration-500 bg-linear-to-br from-blue-50 to-indigo-50"
                >
                  {item.images && item.images.length > 0 ? (
                    <img
                      className="w-full h-50 object-cover"
                      src={item.images[0]}
                      alt={item.title || item.name}
                    />
                  ) : (
                    <div className="w-full h-50 bg-linear-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <span className="text-gray-500 font-medium">No Image</span>
                    </div>
                  )}
                  <div className="p-2">
                    <p className="text-gray-900 text-lg font-medium truncate">{item.title || item.name}</p>
                    <p className="text-gray-600 text-sm -mt-1">{item.location}</p>
                    <div className="flex items-center gap-1 text-sm font-medium mt-1">
                      <span className="text-blue-600">${item.pricePerNight || item.price || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tourism Row */}

        <div className="w-full pt-5 mt-2">
          <h2 className="text-xl font-medium mb-4 text-gray-700">Top Tourism</h2>
          <div className="w-full flex flex-col lg:flex-row gap-6 items-center">
            <div className="w-full">
              <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 px-3 sm:px-0 auto-rows-fr">
                {tourism.slice(0, 5).map((item, index) => (
                  <div
                    key={`tourism-${index}`}
                    onClick={() => {
                      navigate(`/tourism/${item._id}`);
                      window.scrollTo(0, 0);
                    }}
                    className="border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:-translate-y-2.5 transition-all duration-500 bg-linear-to-br from-blue-50 to-indigo-50"
                  >
                    {item.images && item.images.length > 0 ? (
                      <img
                        className="w-full h-50 object-cover"
                        src={item.images[0]}
                        alt={item.name}
                      />
                    ) : (
                      <div className="w-full h-50 bg-linear-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <span className="text-gray-500 font-medium">No Image</span>
                      </div>
                    )}
                    <div className="p-2">
                      <p className="text-gray-900 text-lg font-medium truncate">{item.name}</p>
                      <p className="text-gray-600 text-sm -mt-1">{item.location}</p>
                      
                    <div className="flex items-center gap-1 text-sm font-medium mt-1">
                      <span className="text-blue-900"><span className="text-blue-900">Price:</span> ₹{item.entryFee || item.price}</span>
                    </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>


      {/* Events Row */}
      <div className="w-full pt-5 mt-2">
        <h2 className="text-xl font-medium mb-4 text-gray-700">Top Events</h2>
        <div className="w-full flex flex-col lg:flex-row gap-6 items-center">
          <div className="w-full">
            <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 px-3 sm:px-0 auto-rows-fr">
              {events.slice(0, 5).map((item, index) => (
                <div
                  key={`event-${index}`}
                  onClick={() => {
                    navigate(`/events/${item._id}`);
                    window.scrollTo(0, 0);
                  }}
                  className="border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:-translate-y-2.5 transition-all duration-500 bg-linear-to-br from-blue-50 to-indigo-50"
                >
                  {item.images && item.images.length > 0 ? (
                    <img
                      className="w-full h-50 object-cover"
                      src={item.images[0]}
                      alt={item.title || item.name}
                    />
                  ) : (
                    <div className="w-full h-50 bg-linear-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <span className="text-gray-500 font-medium">No Image</span>
                    </div>
                  )}
                  <div className="p-2">
                    <p className="text-gray-900 text-lg font-medium truncate">{item.title || item.name}</p>
                    <p className="text-gray-600 text-sm -mt-1">{item.location}</p>
                    <div className="flex items-center gap-1 text-sm font-medium mt-1">
                    <span className="text-blue-600">${item.price || item.ticketPrice}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopServices;


