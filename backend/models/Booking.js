const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    // The user who booked
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Type of booked item
    itemType: {
      type: String,
      enum: ["Event", "Hotel", "Tourism"],
      required: true,
    },

    // ID of the booked item
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "itemType", // Dynamic reference to Event, Hotel, or Tourism
    },

    // For Event & Tourism bookings
    bookingDate: {
      type: Date,
    },
    bookingTime: {
      type: String, // hh:mm AM/PM
      match: [/^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i, "Time must be in hh:mm AM/PM format"],
    },

    // For Hotel bookings
    bookingFromDate: {
      type: Date,
    },
    bookingFromTime: {
      type: String,
      match: [/^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i, "Time must be in hh:mm AM/PM format"],
    },
    bookingToDate: {
      type: Date,
    },
    bookingToTime: {
      type: String,
      match: [/^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i, "Time must be in hh:mm AM/PM format"],
    },

    // Number of seats (Event/Tourism) or rooms (Hotel)
    totalSeatsOrRooms: {
      type: Number,
      required: true,
      min: 1,
    },

    // Total price of booking
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    // Booking status
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
