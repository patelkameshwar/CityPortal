const mongoose = require("mongoose");

const hotelSchema = new mongoose.Schema(
  {
    // Hotel Basic Info
    name: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    pricePerNight: {
      type: Number,
      required: true,
      min: 0,
    },

    images: {
      type: [String],
      default: [],
    },

    // Booking FROM date (4 Jan, 2026)
    bookingFromDate: {
      type: Date,
      required: true,
    },

    // Booking FROM time (12:00 PM)
    bookingFromTime: {
      type: String,
      required: true,
      match: [
        /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i,
        "Time must be in hh:mm AM/PM format",
      ],
    },

    // Booking TO date (6 Jan, 2026)
    bookingToDate: {
      type: Date,
      required: true,
    },

    // Booking TO time (10:00 AM)
    bookingToTime: {
      type: String,
      required: true,
      match: [
        /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i,
        "Time must be in hh:mm AM/PM format",
      ],
    },

    // Created by (Client / Admin)
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Hotel", hotelSchema);
