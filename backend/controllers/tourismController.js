const Tourism = require("../models/Tourism");
const Booking = require("../models/Booking"); // Optional, for cancelling bookings

/**
 * CREATE TOURISM PLACE
 * Access: Client / Admin
 * Route: POST /api/tourism
 */
exports.createTourism = async (req, res) => {
  try {
    const {
      name,
      location,
      description,
      entryFee,
      openTime,
      closeTime,
      bookingDate,
      bookingTime,
    } = req.body;

    if (!bookingDate || !bookingTime) {
      return res.status(400).json({ success: false, message: "Booking date and time are required" });
    }

    const images = req.files ? req.files.map((file) => file.path) : [];

    const tourism = await Tourism.create({
      name,
      location,
      description,
      entryFee,
      openTime,
      closeTime,
      bookingDate,
      bookingTime,
      images,
      owner: req.user.id,
    });

    res.status(201).json({ success: true, message: "Tourism place created successfully", tourism });
  } catch (error) {
    console.error("Create Tourism Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET ALL TOURISM PLACES
 * Access: Public
 * Route: GET /api/tourism
 */
exports.getAllTourism = async (req, res) => {
  try {
    const tourismPlaces = await Tourism.find()
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, tourismPlaces });
  } catch (error) {
    console.error("Get All Tourism Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET SINGLE TOURISM PLACE
 * Access: Public
 * Route: GET /api/tourism/:id
 */
exports.getTourismById = async (req, res) => {
  try {
    const tourism = await Tourism.findById(req.params.id).populate("owner", "name email");

    if (!tourism) return res.status(404).json({ success: false, message: "Tourism place not found" });

    res.status(200).json({ success: true, tourism });
  } catch (error) {
    console.error("Get Tourism Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * UPDATE TOURISM PLACE
 * Access: Owner / Admin
 * Route: PUT /api/tourism/:id
 */
exports.updateTourism = async (req, res) => {
  try {
    const tourism = await Tourism.findById(req.params.id);
    if (!tourism) return res.status(404).json({ success: false, message: "Tourism place not found" });

    if (req.user.role !== "admin" && tourism.owner.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: "Not authorized" });

    const images = req.files?.length ? req.files.map((file) => file.path) : tourism.images;

    tourism.name = req.body.name || tourism.name;
    tourism.location = req.body.location || tourism.location;
    tourism.description = req.body.description || tourism.description;
    tourism.entryFee = req.body.entryFee || tourism.entryFee;
    tourism.openTime = req.body.openTime || tourism.openTime;
    tourism.closeTime = req.body.closeTime || tourism.closeTime;
    tourism.bookingDate = req.body.bookingDate || tourism.bookingDate;
    tourism.bookingTime = req.body.bookingTime || tourism.bookingTime;
    tourism.images = images;

    await tourism.save();

    res.status(200).json({ success: true, message: "Tourism place updated successfully", tourism });
  } catch (error) {
    console.error("Update Tourism Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * DELETE TOURISM PLACE
 * Access: Owner / Admin
 * Route: DELETE /api/tourism/:id
 */
exports.deleteTourism = async (req, res) => {
  try {
    const tourism = await Tourism.findById(req.params.id);
    if (!tourism) return res.status(404).json({ success: false, message: "Tourism place not found" });

    if (req.user.role !== "admin" && tourism.owner.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: "Not authorized" });

    // Optional: Cancel all related bookings
    await Booking.updateMany(
      { itemType: "Tourism", itemId: tourism._id },
      { status: "Cancelled" }
    );

    await tourism.deleteOne();

    res.status(200).json({ success: true, message: "Tourism place deleted successfully" });
  } catch (error) {
    console.error("Delete Tourism Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
