const Hotel = require("../models/Hotel");
const Booking = require("../models/Booking"); // Optional, for cancelling bookings

/**
 * CREATE HOTEL
 * Access: Client / Admin
 * Route: POST /api/hotels
 */
exports.createHotel = async (req, res) => {
  try {
    const {
      name,
      location,
      description,
      pricePerNight,
      bookingFromDate,
      bookingFromTime,
      bookingToDate,
      bookingToTime,
    } = req.body;

    if (!bookingFromDate || !bookingFromTime || !bookingToDate || !bookingToTime) {
      return res.status(400).json({ success: false, message: "Booking from/to date and time are required" });
    }

    const images = req.files ? req.files.map((file) => file.path) : [];

    const hotel = await Hotel.create({
      name,
      location,
      description,
      pricePerNight,
      bookingFromDate,
      bookingFromTime,
      bookingToDate,
      bookingToTime,
      images,
      owner: req.user.id,
    });

    res.status(201).json({ success: true, message: "Hotel created successfully", hotel });
  } catch (error) {
    console.error("Create Hotel Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET ALL HOTELS
 * Access: Public
 * Route: GET /api/hotels
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

/**
 * GET SINGLE HOTEL
 * Access: Public
 * Route: GET /api/hotels/:id
 */
exports.getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id).populate("owner", "name email");

    if (!hotel) return res.status(404).json({ success: false, message: "Hotel not found" });

    res.status(200).json({ success: true, hotel });
  } catch (error) {
    console.error("Get Hotel Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * UPDATE HOTEL
 * Access: Owner / Admin
 * Route: PUT /api/hotels/:id
 */
exports.updateHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ success: false, message: "Hotel not found" });

    if (req.user.role !== "admin" && hotel.owner.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: "Not authorized" });

    const images = req.files?.length ? req.files.map((file) => file.path) : hotel.images;

    hotel.name = req.body.name || hotel.name;
    hotel.location = req.body.location || hotel.location;
    hotel.description = req.body.description || hotel.description;
    hotel.pricePerNight = req.body.pricePerNight || hotel.pricePerNight;
    hotel.bookingFromDate = req.body.bookingFromDate || hotel.bookingFromDate;
    hotel.bookingFromTime = req.body.bookingFromTime || hotel.bookingFromTime;
    hotel.bookingToDate = req.body.bookingToDate || hotel.bookingToDate;
    hotel.bookingToTime = req.body.bookingToTime || hotel.bookingToTime;
    hotel.images = images;

    await hotel.save();

    res.status(200).json({ success: true, message: "Hotel updated successfully", hotel });
  } catch (error) {
    console.error("Update Hotel Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * DELETE HOTEL
 * Access: Owner / Admin
 * Route: DELETE /api/hotels/:id
 */
exports.deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ success: false, message: "Hotel not found" });

    if (req.user.role !== "admin" && hotel.owner.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: "Not authorized" });

    // Optional: Cancel related bookings
    await Booking.updateMany(
      { itemType: "Hotel", itemId: hotel._id },
      { status: "Cancelled" }
    );

    await hotel.deleteOne();

    res.status(200).json({ success: true, message: "Hotel deleted successfully" });
  } catch (error) {
    console.error("Delete Hotel Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
