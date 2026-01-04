const Tourism = require("../models/Tourism");
const Booking = require("../models/Booking");

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
      bookingFromDate,
      bookingFromTime,
      bookingToDate,
      bookingToTime,
      totalVisitors,
    } = req.body;

    if (!bookingFromDate || !bookingFromTime || !bookingToDate || !bookingToTime) {
      return res.status(400).json({
        success: false,
        message: "Booking from/to date and time are required",
      });
    }

    const images = req.files ? req.files.map((file) => file.path) : [];

    const tourism = await Tourism.create({
      name,
      location,
      description,
      entryFee,
      openTime,
      closeTime,
      bookingFromDate,
      bookingFromTime,
      bookingToDate,
      bookingToTime,
      totalVisitors: totalVisitors || 100,
      availableVisitors: totalVisitors || 100,
      images,
      owner: req.user.id,
    });

    res
      .status(201)
      .json({ success: true, message: "Tourism place created successfully", tourism });
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

    if (!tourism)
      return res.status(404).json({ success: false, message: "Tourism place not found" });

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
    if (!tourism)
      return res.status(404).json({ success: false, message: "Tourism place not found" });

    if (req.user.role !== "admin" && tourism.owner.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: "Not authorized" });

    const images = req.files?.length ? req.files.map((file) => file.path) : tourism.images;

    tourism.name = req.body.name || tourism.name;
    tourism.location = req.body.location || tourism.location;
    tourism.description = req.body.description || tourism.description;
    tourism.entryFee = req.body.entryFee || tourism.entryFee;
    tourism.openTime = req.body.openTime || tourism.openTime;
    tourism.closeTime = req.body.closeTime || tourism.closeTime;
    tourism.bookingFromDate = req.body.bookingFromDate || tourism.bookingFromDate;
    tourism.bookingFromTime = req.body.bookingFromTime || tourism.bookingFromTime;
    tourism.bookingToDate = req.body.bookingToDate || tourism.bookingToDate;
    tourism.bookingToTime = req.body.bookingToTime || tourism.bookingToTime;

    // Update totalVisitors safely without breaking existing bookings
    if (req.body.totalVisitors) {
      const usedVisitors = tourism.totalVisitors - tourism.availableVisitors;
      tourism.totalVisitors = req.body.totalVisitors;
      tourism.availableVisitors = Math.max(req.body.totalVisitors - usedVisitors, 0);
    }

    tourism.images = images;

    await tourism.save();

    res
      .status(200)
      .json({ success: true, message: "Tourism place updated successfully", tourism });
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
    if (!tourism)
      return res.status(404).json({ success: false, message: "Tourism place not found" });

    if (req.user.role !== "admin" && tourism.owner.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: "Not authorized" });

    // Cancel all related bookings
    await Booking.updateMany(
      { itemType: "Tourism", itemId: tourism._id },
      { status: "Cancelled" }
    );

    await tourism.deleteOne();

    res
      .status(200)
      .json({ success: true, message: "Tourism place deleted successfully" });
  } catch (error) {
    console.error("Delete Tourism Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * BOOK TOURISM PLACE
 * Access: User
 * Route: POST /api/bookings/tourism/:tourismId
 */
exports.bookTourism = async (req, res) => {
  try {
    const { tourismId } = req.params;
    const { bookingDate, bookingTime, visitors } = req.body;

    const tourism = await Tourism.findById(tourismId);
    if (!tourism)
      return res.status(404).json({ success: false, message: "Tourism place not found" });

    // Check booking date is within allowed range
    const from = new Date(tourism.bookingFromDate);
    const to = new Date(tourism.bookingToDate);
    const requestedDate = new Date(bookingDate);

    if (requestedDate < from || requestedDate > to)
      return res.status(400).json({
        success: false,
        message: `Booking date must be between ${from.toDateString()} and ${to.toDateString()}`,
      });

    // Check if enough visitors are available
    if (visitors > tourism.availableVisitors)
      return res.status(400).json({
        success: false,
        message: `Only ${tourism.availableVisitors} visitors left`,
      });

    // Create booking
    const booking = await Booking.create({
      itemType: "Tourism",
      itemId: tourism._id,
      user: req.user.id,
      bookingDate,
      bookingTime,
      visitors,
      status: "Confirmed",
    });

    // Reduce available visitors
    tourism.availableVisitors -= visitors;
    await tourism.save();

    res.status(201).json({ success: true, message: "Booking successful", booking });
  } catch (error) {
    console.error("Tourism Booking Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
