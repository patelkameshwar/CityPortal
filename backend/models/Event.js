const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    // Basic Info
    title: {
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

    // Event booking availability (support multi-day events)
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

    // Event start time (default daily start time if needed)
    eventTime: {
      type: String,
      required: true,
      match: [
        /^(?:[01]\d|2[0-3]):[0-5]\d$|^(?:0?[1-9]|1[0-2]):[0-5]\d\s?(?:AM|PM)$/i,
        "Invalid time format (use HH:mm 24hr or hh:mm AM/PM)",
      ],
    },

    // Total seats available
    totalSeats: {
      type: Number,
      required: true,
      min: 1,
    },

    // Owner (Client / Admin)
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Price per ticket
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    images: {
      type: [String],
      default: [],
    },

    // Bookings array (stores dynamic bookings)
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
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);

