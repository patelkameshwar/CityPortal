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

    // Total rooms available in the hotel
    totalRooms: {
      type: Number,
      required: true,
      min: 1,
    },

    // Optional default check-in/check-out times
    defaultCheckInTime: {
      type: String,
      default: "12:00 PM",
      match: [
        /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i,
        "Time must be in hh:mm AM/PM format",
      ],
    },

    defaultCheckOutTime: {
      type: String,
      default: "10:00 AM",
      match: [
        /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i,
        "Time must be in hh:mm AM/PM format",
      ],
    },

    // Booking availability dates
    bookingFromDate: {
  type: Date,
  default: () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  },
},

bookingToDate: {
  type: Date,
  default: () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setFullYear(d.getFullYear() + 1);
    return d;
  },
},


    // Created by (Client / Admin)
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bookings: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Hotel", hotelSchema);
