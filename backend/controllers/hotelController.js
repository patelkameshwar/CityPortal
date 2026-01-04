const Hotel = require("../models/Hotel");
const Booking = require("../models/Booking");

/**
 * CREATE HOTEL
 * Access: Client / Admin
 */
exports.createHotel = async (req, res) => {
  try {
    const {
      name,
      location,
      description,
      pricePerNight,
      totalRooms,
      defaultCheckInTime,
      defaultCheckOutTime,
      bookingFromDate,
      bookingToDate,
    } = req.body;

    if (!name || !location || !pricePerNight || !totalRooms) {
      return res.status(400).json({
        success: false,
        message: "Name, location, pricePerNight, and totalRooms are required",
      });
    }

    const images = req.files ? req.files.map((file) => file.path) : [];

    const hotel = await Hotel.create({
      name,
      location,
      description,
      pricePerNight,
      totalRooms,
      defaultCheckInTime: defaultCheckInTime || "12:00 PM",
      defaultCheckOutTime: defaultCheckOutTime || "10:00 AM",
      bookingFromDate: bookingFromDate ? new Date(bookingFromDate) : Date.now(),
      bookingToDate: bookingToDate
        ? new Date(bookingToDate)
        : new Date(+new Date() + 365 * 24 * 60 * 60 * 1000), 
      images,
      owner: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Hotel created successfully",
      hotel,
    });
  } catch (error) {
    console.error("Create Hotel Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET ALL HOTELS
 * Access: Public
 */
exports.getAllHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find()
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, hotels });
  } catch (error) {
    console.error("Get All Hotels Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/*
 * GET SINGLE HOTEL
 * Access: Public
 */
exports.getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id).populate(
      "owner",
      "name email"
    );

    if (!hotel) {
      return res
        .status(404)
        .json({ success: false, message: "Hotel not found" });
    }

    res.status(200).json({ success: true, hotel });
  } catch (error) {
    console.error("Get Hotel Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/*
 * UPDATE HOTEL
 * Access: Owner / Admin
 */
exports.updateHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res
        .status(404)
        .json({ success: false, message: "Hotel not found" });
    }

    if (req.user.role !== "admin" && hotel.owner.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    const images = req.files?.length ? req.files.map((file) => file.path) : hotel.images;

    hotel.name = req.body.name || hotel.name;
    hotel.location = req.body.location || hotel.location;
    hotel.description = req.body.description || hotel.description;
    hotel.pricePerNight = req.body.pricePerNight || hotel.pricePerNight;
    hotel.totalRooms = req.body.totalRooms || hotel.totalRooms;
    hotel.defaultCheckInTime = req.body.defaultCheckInTime || hotel.defaultCheckInTime;
    hotel.defaultCheckOutTime = req.body.defaultCheckOutTime || hotel.defaultCheckOutTime;
    hotel.images = images;

    // Update booking availability dates
    hotel.bookingFromDate = req.body.bookingFromDate
      ? new Date(req.body.bookingFromDate)
      : hotel.bookingFromDate;
    hotel.bookingToDate = req.body.bookingToDate
      ? new Date(req.body.bookingToDate)
      : hotel.bookingToDate;

    await hotel.save();

    res.status(200).json({
      success: true,
      message: "Hotel updated successfully",
      hotel,
    });
  } catch (error) {
    console.error("Update Hotel Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/*
 * DELETE HOTEL
 * Access: Owner / Admin
 */
exports.deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res
        .status(404)
        .json({ success: false, message: "Hotel not found" });
    }

    if (req.user.role !== "admin" && hotel.owner.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    // Cancel all related bookings automatically
    await Booking.updateMany(
      { itemType: "Hotel", itemId: hotel._id },
      { status: "Cancelled" }
    );

    await hotel.deleteOne();

    res.status(200).json({
      success: true,
      message: "Hotel deleted successfully",
    });
  } catch (error) {
    console.error("Delete Hotel Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
