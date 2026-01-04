const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
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

    // Event start date
    eventDate: {
      type: Date,
      required: true,
    },

    // Event start time
    eventTime: {
      type: String,
      required: true,
      match: [
        /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i,
        "Time must be in format hh:mm AM/PM",
      ],
    },

    // Total seats available for the event
    totalSeats: {
      type: Number,
      required: true,
      min: 1,
    },

    // Seats already booked
    availableSeats: {
      type: Number,
      default: function () {
        return this.totalSeats;
      },
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

    // Owner (Client/Admin who created the event)
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Array of booking ranges for calendar-like flexibility
    bookings: {
      type: [
        {
          user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          bookedAt: { type: Date, default: Date.now },
          seats: { type: Number, required: true, min: 1 },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
