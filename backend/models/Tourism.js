const mongoose = require("mongoose");

const tourismSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    description: String,

    entryFee: {
      type: Number,
      required: true,
    },

    openTime: {
      type: String, // e.g. "09:00 AM"
      required: true,
    },

    closeTime: {
      type: String, // e.g. "06:00 PM"
      required: true,
    },

    images: [String],

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tourism", tourismSchema);
