import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
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

  const parseEventTime = (timeStr) => {
    timeStr = timeStr.toUpperCase().trim();
    let hours = 0,
      mins = 0;
    const isPM = timeStr.includes("PM");
    const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      hours = parseInt(timeMatch[1]);
      mins = parseInt(timeMatch[2]);
      if (isPM && hours !== 12) hours += 12;
    }
    return hours * 60 + mins;
  };

  const isPastEvent = (event) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const now = new Date();

    const endDateStr =
      event.bookingToDate || event.bookingFromDate || event.eventDate;
    if (!endDateStr) return true;

    const endDate = new Date(endDateStr);
    endDate.setHours(0, 0, 0, 0);

    if (endDate < today) return true;
    if (endDate > today) return false;

    const eventTimeMins = parseEventTime(event.eventTime || "00:00");
    const currentMins = now.getHours() * 60 + now.getMinutes();
    return eventTimeMins <= currentMins;
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

      {/* ------------------ Hotels ------------------ */}
      <div className="w-full pt-5 mt-2">
        <h2 className="text-xl font-medium mb-4 text-gray-700">Top Hotels</h2>
        <div className="w-full overflow-x-auto sm:overflow-visible scroll-smooth">
          <div className="flex sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 px-3 sm:px-0 snap-x snap-mandatory">
            {hotels.slice(0, 5).map((item, index) => (
              <div
                key={`hotel-${index}`}
                onClick={() => {
                  navigate(`/hotels/${item._id}`);
                  window.scrollTo(0, 0);
                }}
                className="min-w-40 sm:min-w-0 snap-start h-full flex flex-col border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:-translate-y-2 hover:shadow-lg transition-all duration-300 bg-linear-to-br from-blue-50 to-indigo-50"
              >
                {item.images?.length > 0 ? (
                  <img
                    className="w-full h-40 sm:h-48 md:h-50 object-cover"
                    src={item.images[0]}
                    alt={item.title || item.name}
                  />
                ) : (
                  <div className="w-full h-40 sm:h-48 md:h-50 bg-linear-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <span className="text-gray-500 font-medium">No Image</span>
                  </div>
                )}
                <div className="p-2 flex flex-col grow">
                  <p className="text-gray-900 text-sm sm:text-base md:text-lg font-medium line-clamp-2">
                    {item.title || item.name}
                  </p>
                  <p className="text-gray-600 text-sm -mt-1">{item.location}</p>
                  <div className="text-sm font-medium mt-1 text-blue-600">
                    Price: ₹{item.pricePerNight || item.price || 0}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ------------------ Tourism ------------------ */}
      <div className="w-full pt-5 mt-2">
        <h2 className="text-xl font-medium mb-4 text-gray-700">Top Tourism</h2>

        <div className="w-full overflow-x-auto sm:overflow-visible scroll-smooth">
          <div className="flex sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 px-3 sm:px-0 snap-x snap-mandatory">
            {tourism.slice(0, 5).map((item, index) => (
              <div
                key={`tourism-${index}`}
                onClick={() => {
                  navigate(`/tourism/${item._id}`);
                  window.scrollTo(0, 0);
                }}
                className="min-w-40 sm:min-w-0 snap-start h-full flex flex-col border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:-translate-y-2 hover:shadow-lg transition-all duration-300 bg-linear-to-br from-blue-50 to-indigo-50"
              >
                {item.images?.length > 0 ? (
                  <img
                    className="w-full h-40 sm:h-48 md:h-50 object-cover"
                    src={item.images[0]}
                    alt={item.name}
                  />
                ) : (
                  <div className="w-full h-40 sm:h-48 md:h-50 bg-linear-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <span className="text-gray-500 font-medium">No Image</span>
                  </div>
                )}

                <div className="p-2 flex flex-col grow">
                  <p className="text-gray-900 text-sm sm:text-base md:text-lg font-medium line-clamp-2">
                    {item.name}
                  </p>
                  <p className="text-gray-600 text-sm -mt-1">{item.location}</p>
                  <div className="text-sm font-medium mt-1 text-blue-600">
                    Price: ₹{item.entryFee || item.price}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ------------------ Events ------------------ */}
      <div className="w-full pt-5 mt-2">
        <h2 className="text-xl font-medium mb-4 text-gray-700">Top Events</h2>

        <div className="w-full overflow-x-auto sm:overflow-visible scroll-smooth">
          <div className="flex sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 px-3 sm:px-0 snap-x snap-mandatory">
            {events
              .filter((event) => !isPastEvent(event))
              .slice(0, 5)
              .map((item, index) => (
                <div
                  key={`event-${index}`}
                  onClick={() => {
                    navigate(`/events/${item._id}`);
                    window.scrollTo(0, 0);
                  }}
                  className="min-w-40 sm:min-w-0 snap-start h-full flex flex-col border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:-translate-y-2 hover:shadow-lg transition-all duration-300 bg-linear-to-br from-blue-50 to-indigo-50"
                >
                  {item.images?.length > 0 ? (
                    <img
                      className="w-full h-40 sm:h-48 md:h-50 object-cover"
                      src={item.images[0]}
                      alt={item.title || item.name}
                    />
                  ) : (
                    <div className="w-full h-40 sm:h-48 md:h-50 bg-linear-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <span className="text-gray-500 font-medium">
                        No Image
                      </span>
                    </div>
                  )}

                  <div className="p-2 flex flex-col grow">
                    <p className="text-gray-900 text-sm sm:text-base md:text-lg font-medium line-clamp-2">
                      {item.title || item.name}
                    </p>
                    <p className="text-gray-600 text-sm -mt-1">
                      {item.location}
                    </p>
                    <div className="text-sm font-medium mt-1 text-blue-600">
                      Price: ₹{item.price || item.ticketPrice}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopServices;
