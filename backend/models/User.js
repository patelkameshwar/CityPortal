const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", ""],
      default: "",
    },
    birthday: {
      type: Date,
      default: null,
    },
    role: {
      type: String,
      enum: ["admin", "client", "user"],
      default: "user",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
