const mongoose = require("mongoose");

const tourismSchema = new mongoose.Schema(
  {
    // Tourism Place Info
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

    // Opening Time (e.g. 09:00 AM)
    openTime: {
      type: String,
      required: true,
      match: [
        /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i,
        "Time must be in hh:mm AM/PM format",
      ],
    },

    // Closing Time (e.g. 06:00 PM)
    closeTime: {
      type: String,
      required: true,
      match: [
        /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i,
        "Time must be in hh:mm AM/PM format",
      ],
    },

    // Booking Dates (from client/admin, like a calendar)
    bookingFromDate: {
      type: Date,
      required: true,
    },

    bookingFromTime: {
      type: String,
      required: true,
      match: [
        /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i,
        "Time must be in hh:mm AM/PM format",
      ],
    },

    bookingToDate: {
      type: Date,
      required: true,
    },

    bookingToTime: {
      type: String,
      required: true,
      match: [
        /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i,
        "Time must be in hh:mm AM/PM format",
      ],
    },

    images: {
      type: [String],
      default: [],
    },

    // Total visitors/seats for that tourism place (optional)
    totalVisitors: {
      type: Number,
      default: 100, // Default 100 visitors per day
      min: 1,
    },

    availableVisitors: {
      type: Number,
      default: function () {
        return this.totalVisitors;
      },
      min: 0,
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
