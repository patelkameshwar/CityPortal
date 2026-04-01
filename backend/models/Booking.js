const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    itemType: {
      type: String,
      enum: ["Hotel", "Event", "Tourism"],
      required: true,
    },

    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "itemType",
    },

    bookingType: {
      type: String,
      enum: ["night", "hour"],
      default: "night",
    },

    // ✅ NEW FIELD (ONLY FOR HOURLY)
    hours: {
      type: Number,
      enum: [3, 6, 9],
      default: null,
    },

    bookingFromDate: Date,
    bookingFromTime: String,
    bookingToDate: Date,
    bookingToTime: String,

    bookingDate: Date,
    bookingTime: String,

    totalQuantity: {
      type: Number,
      required: true,
      min: 1,
    },

    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["Confirmed", "Cancelled"],
      default: "Confirmed",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
