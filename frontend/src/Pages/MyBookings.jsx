import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { bookingAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { FiCalendar, FiMapPin, FiHome } from "react-icons/fi";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyBookings();
    }
  }, [isAuthenticated]);

  const fetchMyBookings = async () => {
    try {
      const response = await bookingAPI.getMyBookings();
      setBookings(response.data.bookings || []);
    } catch (err) {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    setCancelLoading(bookingId);
    try {
      await bookingAPI.cancel(bookingId);
      setBookings(
        bookings.map((booking) =>
          booking._id === bookingId
            ? { ...booking, status: "Cancelled" }
            : booking
        )
      );
      toast.success("Booking cancelled successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel booking");
    } finally {
      setCancelLoading(null);
    }
  };

  const getItemIcon = (itemType) => {
    switch (itemType) {
      case "Hotel":
        return <FiHome className="h-5 w-5" />;
      case "Event":
        return <FiCalendar className="h-5 w-5" />;
      case "Tourism":
        return <FiMapPin className="h-5 w-5" />;
      default:
        return <FiCalendar className="h-5 w-5" />;
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (time) => {
    if (!time) return "";

    // If time includes 'T', treat as full ISO datetime
    if (time.includes("T")) {
      const t = new Date(time);
      return t.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }

    // Otherwise, assume it's "HH:mm" format
    return new Date(`1970-01-01T${time}`).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Please Login</h2>
        <p className="text-gray-600">
          You need to login to view your bookings.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <p className="pb-3 mt-12 font-medium text-zinc-700 border-b">
        My Bookings
      </p>
      <div>
        {bookings.length > 0 ? (
          bookings.map((booking, index) => (
            <div
              className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b"
              key={index}
            >
              {/* Image Section */}
              <div>
                {booking.itemId?.images && booking.itemId.images.length > 0 ? (
                  <img
                    className="w-32 bg-indigo-50 object-cover rounded"
                    src={booking.itemId.images[0]}
                    alt={booking.itemId?.name || booking.itemId?.title || "Booking"}
                  />
                ) : (
                  <div className="w-32 h-32 bg-indigo-50 flex items-center justify-center">
                    {getItemIcon(booking.itemType)}
                  </div>
                )}
              </div>

              {/* Details Section */}
              <div className="flex-1 text-sm text-zinc-600">
                {/* Item name | type */}
                <p className="text-neutral-800 font-semibold flex items-center gap-2">
                  {booking.itemId?.name || booking.itemId?.title || "Unknown Item"}
                  <span className="text-zinc-500">|</span>
                  <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">
                    {booking.itemType}
                  </span>
                </p>

                {/* BookingType + Date & Time */}
                {booking.itemType === "Hotel" && booking.bookingType && (
  <>
    <p className="text-zinc-700 font-medium mt-1">
      Booking ({booking.bookingType === "hour"
        ? `Hourly (${booking.hours || 0} hours)`
        : "Nightly"}):
    </p>

    <p className="text-xs text-zinc-600 mt-1">
      {formatDate(booking.bookingFromDate)}
      {" | "}
      {formatTime(
        booking.bookingFromTime || booking.checkInTime || booking.bookingTime || booking.bookingFromDate
      )}
      {" → "}
      {formatDate(booking.bookingToDate || booking.bookingFromDate)}
      {" | "}
      {formatTime(
        booking.bookingToTime || booking.checkOutTime || booking.bookingFromTime || booking.bookingToDate || booking.bookingFromDate
      )}
    </p>
  </>
)}

                {/* Non-Hotel Booking */}
                {booking.itemType !== "Hotel" && (
                  <>
                    <p className="text-zinc-700 font-medium mt-1">
                      Booking Date:
                    </p>
                    <p className="text-xs">
                      {formatDate(booking.bookingDate || booking.bookingFromDate)}
                      {booking.bookingToDate &&
                        ` - ${formatDate(booking.bookingToDate)}`}
                    </p>
                    {booking.bookingTime && (
                      <p className="text-xs mt-1">
                        <span className="text-sm text-neutral-700 font-medium">
                          Time:
                        </span>{" "}
                        {booking.bookingTime}
                      </p>
                    )}
                  </>
                )}

                {/* Quantity & Price */}
                <div className="text-xs mt-1 flex items-center gap-4">
                  <p>
                    <span className="text-sm text-neutral-700 font-medium">
                      Quantity:
                    </span>{" "}
                    {booking.totalQuantity}{" "}
                    {booking.itemType === "Hotel" ? "room(s)" : "ticket(s)"}
                  </p>

                  <p>
                    <span className="text-sm text-neutral-700 font-medium">
                      Price:
                    </span>{" "}
                    ${booking.totalPrice}
                  </p>
                </div>
              </div>

              <div></div>

              {/* Action Buttons Section */}
              <div className="flex flex-col gap-2 justify-end">
                {booking.status === "Confirmed" && (
                  <>
                    <button
                      className="text-sm bg-green-600 text-white text-center sm:min-w-48 py-2 border rounded hover:bg-green-700 transition-all duration-300"
                      onClick={() =>
                        toast.info("Payment gateway integration coming soon")
                      }
                    >
                      Pay Online
                    </button>
                    <button
                      onClick={() => handleCancelBooking(booking._id)}
                      disabled={cancelLoading === booking._id}
                      className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300"
                    >
                      {cancelLoading === booking._id
                        ? "Cancelling..."
                        : "Cancel Booking"}
                    </button>
                  </>
                )}
                {booking.status === "Cancelled" && (
                  <button className="sm:min-w-48 py-2 border border-red-500 rounded text-red-500">
                    Booking Cancelled
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <FiCalendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">No bookings found</p>
            <p className="text-gray-400 mt-2">
              Start exploring hotels, events, and tourist spots!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;