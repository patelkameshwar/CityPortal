const mongoose = require("mongoose");

const tourismSchema = new mongoose.Schema(
  {
    // Basic Info
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

    // Entry Fee
    entryFee: {
      type: Number,
      required: true,
      min: 0,
    },

    // Default visiting hours (optional)
    openTime: {
      type: String,
      required: true,
      default: "09:00 AM",
      match: [
        /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i,
        "Time must be in hh:mm AM/PM format",
      ],
    },

    closeTime: {
      type: String,
      required: true,
      default: "06:00 PM",
      match: [
        /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i,
        "Time must be in hh:mm AM/PM format",
      ],
    },

    // Booking availability (support multi-day bookings)
    bookingFromDate: {
      type: Date,
      required: true,
      default: () => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
      },
    },

    bookingToDate: {
      type: Date,
      required: true,
      default: () => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        d.setFullYear(d.getFullYear() + 1);
        return d;
      },
    },

    // Total visitors per day
    totalVisitors: {
      type: Number,
      required: true,
      min: 1,
      default: 100,
    },

    // Bookings array per day
    bookings: {
      type: [
        {
          user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          bookedAt: { type: Date, default: Date.now },
          seats: { type: Number, required: true, min: 1 },
          bookingDate: { type: Date, required: true },
        },
      ],
      default: [],
    },

    images: {
      type: [String],
      default: [],
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

module.exports = mongoose.model("Tourism", tourismSchema);
