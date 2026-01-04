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

    // Booking Date (same as Event: 4 Jan, 2026)
    bookingDate: {
      type: Date,
      required: true,
    },

    // Booking Time (same as Event: 6:45 PM)
    bookingTime: {
      type: String,
      required: true,
      match: [
        /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i,
        "Time must be in hh:mm AM/PM format",
      ],
    },

    // Images
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
