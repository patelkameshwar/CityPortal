const Tourism = require("../models/Tourism");
const Booking = require("../models/Booking");

/**
 * CREATE TOURISM PLACE
 * Access: Client / Admin 
 */
exports.createTourism = async (req, res) => {
  try {
    console.log('Tourism files received:', req.files?.length || 0);
    
    if (req.files && req.files.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Maximum 50 images allowed"
      });
    }

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

    if (!bookingFromDate || !bookingToDate || !bookingFromTime || !bookingToTime) {
      return res.status(400).json({
        success: false,
        message: "Booking from/to date and time are required",
      });
    }

    const from = new Date(bookingFromDate);
    const to = new Date(bookingToDate);

    // Validate that end date is after start date
    if (from >= to) {
      return res.status(400).json({ success: false, message: "End date must be after start date" });
    }

    const images = req.files ? req.files.map((file) => file.path) : [];

    const tourism = await Tourism.create({
      name,
      location,
      description,
      entryFee,
      openTime,
      closeTime,
      bookingFromDate: from,
      bookingFromTime,
      bookingToDate: to,
      bookingToTime,
      totalVisitors: totalVisitors || 100,
      bookings: [], // Store per-day bookings
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
 */
exports.getAllTourism = async (req, res) => {
  try {
    const tourismPlaces = await Tourism.find()
      .populate("owner", "name email")
      .sort({ createdAt: -1, _id: -1 });

    res.status(200).json({ success: true, tourismPlaces });
  } catch (error) {
    console.error("Get All Tourism Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET SINGLE TOURISM PLACE
 * Access: Public
 */
exports.getTourismById = async (req, res) => {
  try {
    const tourism = await Tourism.findById(req.params.id)
      .populate("owner", "name email")
      .populate("bookings.user", "name email");

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
 */
exports.updateTourism = async (req, res) => {
  try {
    console.log('Update tourism files received:', req.files?.length || 0, 'imagesToRemove:', req.body.imagesToRemove);
    
    if (req.files && req.files.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Maximum 50 images allowed"
      });
    }

    const tourism = await Tourism.findById(req.params.id);
    if (!tourism)
      return res.status(404).json({ success: false, message: "Tourism place not found" });

    if (req.user.role !== "admin" && tourism.owner.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: "Not authorized" });

    // Handle image removal
    const imagesToRemove = req.body.imagesToRemove ? req.body.imagesToRemove.split(',').map(url => url.trim()).filter(Boolean) : [];
    const remainingImages = tourism.images.filter(img => !imagesToRemove.includes(img));
    
    // Delete removed images from Cloudinary
    if (imagesToRemove.length > 0) {
      const { deleteCloudinaryImages } = require('./utils/cloudinaryUtils');
      const deleteResult = await deleteCloudinaryImages(imagesToRemove);
      console.log('Cloudinary delete result:', deleteResult);
    }

    // Handle new images (append to remaining)
    const newImages = req.files ? req.files.map((file) => file.path) : [];
    tourism.images = newImages.length ? [...remainingImages, ...newImages] : remainingImages;

    tourism.name = req.body.name || tourism.name;
    tourism.location = req.body.location || tourism.location;
    tourism.description = req.body.description || tourism.description;
    tourism.entryFee = req.body.entryFee || tourism.entryFee;
    tourism.openTime = req.body.openTime || tourism.openTime;
    tourism.closeTime = req.body.closeTime || tourism.closeTime;
    if (req.body.bookingFromDate) tourism.bookingFromDate = new Date(req.body.bookingFromDate);
    if (req.body.bookingToDate) tourism.bookingToDate = new Date(req.body.bookingToDate);
    tourism.bookingFromTime = req.body.bookingFromTime || tourism.bookingFromTime;
    tourism.bookingToTime = req.body.bookingToTime || tourism.bookingToTime;

    // Validate booking dates
    if (tourism.bookingFromDate >= tourism.bookingToDate) {
      return res.status(400).json({ success: false, message: "End date must be after start date" });
    }

    // Update totalVisitors safely without breaking existing bookings
    if (req.body.totalVisitors) {
      const usedVisitors = tourism.bookings.reduce((sum, b) => sum + b.visitors, 0);
      tourism.totalVisitors = req.body.totalVisitors;
      // Note: availableVisitors now calculated per day dynamically
    }

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
 */
exports.deleteTourism = async (req, res) => {
  try {
    const tourism = await Tourism.findById(req.params.id);
    if (!tourism)
      return res.status(404).json({ success: false, message: "Tourism place not found" });

    if (req.user.role !== "admin" && tourism.owner.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: "Not authorized" });

    // Cancel all related bookings
    await Booking.updateMany({ itemType: "Tourism", itemId: tourism._id }, { status: "Cancelled" });

    await tourism.deleteOne();

    res.status(200).json({ success: true, message: "Tourism place deleted successfully" });
  } catch (error) {
    console.error("Delete Tourism Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * BOOK TOURISM PLACE
 * Access: User
 */
exports.bookTourism = async (req, res) => {
  try {
    const { tourismId } = req.params;
    const { bookingDate, bookingTime, visitors } = req.body;

    const tourism = await Tourism.findById(tourismId);
    if (!tourism)
      return res.status(404).json({ success: false, message: "Tourism place not found" });

    if (!bookingDate || !bookingTime || !visitors || visitors < 1) {
      return res.status(400).json({ success: false, message: "Booking date, time, and visitors required" });
    }

    const date = new Date(bookingDate);
    const from = new Date(tourism.bookingFromDate);
    const to = new Date(tourism.bookingToDate);

    if (date < from || date > to) {
      return res.status(400).json({ success: false, message: `Booking date must be between ${from.toDateString()} and ${to.toDateString()}` });
    }

    // Calculate total visitors already booked on that day
    const bookedVisitors = tourism.bookings
      .filter(b => b.bookingDate.toDateString() === date.toDateString())
      .reduce((sum, b) => sum + b.visitors, 0);

    if (bookedVisitors + visitors > tourism.totalVisitors) {
      return res.status(400).json({ success: false, message: `Only ${tourism.totalVisitors - bookedVisitors} visitors left on this date` });
    }

    // Add booking to tourism place
    tourism.bookings.push({ user: req.user.id, bookingDate: date, visitors });
    await tourism.save();

    // Create booking record
    const booking = await Booking.create({
      itemType: "Tourism",
      itemId: tourism._id,
      user: req.user.id,
      bookingDate: date,
      bookingTime,
      visitors,
      status: "Confirmed",
    });

    res.status(201).json({ success: true, message: "Booking successful", booking });
  } catch (error) {
    console.error("Tourism Booking Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
