const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    // User who made the booking
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Type of booked item
    itemType: {
      type: String,
      enum: ["Hotel", "Event", "Tourism"],
      required: true,
    },

    // Reference to booked item (dynamic based on itemType)
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "itemType",
    },

    // HOTEL: Check-in / Check-out
    bookingFromDate: {
      type: Date,
    },
    bookingFromTime: {
      type: String,
      match: [
        /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i,
        "Time must be in hh:mm AM/PM format",
      ],
    },
    bookingToDate: {
      type: Date,
    },
    bookingToTime: {
      type: String,
      match: [
        /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i,
        "Time must be in hh:mm AM/PM format",
      ],
    },

    // EVENT / TOURISM: Specific date & time
    bookingDate: {
      type: Date,
    },
    bookingTime: {
      type: String,
      match: [
        /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i,
        "Time must be in hh:mm AM/PM format",
      ],
    },

    // Number of rooms (Hotel) or seats/visitors (Event/Tourism)
    totalQuantity: {
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
