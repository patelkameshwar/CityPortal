const Booking = require("../models/Booking");
const Event = require("../models/Event");
const Hotel = require("../models/Hotel");
const Tourism = require("../models/Tourism");

/**
 * CREATE BOOKING
 * Access: User
 * Route: POST /api/bookings
 */
exports.createBooking = async (req, res) => {
  try {
    const {
      itemType,
      itemId,

      // Event & Tourism
      bookingDate,
      bookingTime,

      // Hotel
      bookingFromDate,
      bookingFromTime,
      bookingToDate,
      bookingToTime,

      totalSeatsOrRooms,
    } = req.body;

    if (!itemType || !itemId || !totalSeatsOrRooms) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const validTypes = ["Event", "Hotel", "Tourism"];
    if (!validTypes.includes(itemType)) {
      return res.status(400).json({ message: "Invalid item type" });
    }

    let item;
    let totalPrice = 0;

    // ================= EVENT BOOKING =================
    if (itemType === "Event") {
      item = await Event.findById(itemId);
      if (!item) return res.status(404).json({ message: "Event not found" });

      if (item.availableSeats < totalSeatsOrRooms) {
        return res.status(400).json({ message: "Not enough seats available" });
      }

      totalPrice = item.price * totalSeatsOrRooms;

      // Reduce seats immediately
      item.availableSeats -= totalSeatsOrRooms;
      await item.save();
    }

    // ================= HOTEL BOOKING =================
    if (itemType === "Hotel") {
      item = await Hotel.findById(itemId);
      if (!item) return res.status(404).json({ message: "Hotel not found" });

      const from = new Date(bookingFromDate);
      const to = new Date(bookingToDate);

      if (from >= to) {
        return res.status(400).json({ message: "Invalid hotel booking dates" });
      }

      const nights =
        (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24);

      totalPrice = nights * item.pricePerNight * totalSeatsOrRooms;
    }

    // ================= TOURISM BOOKING =================
    if (itemType === "Tourism") {
      item = await Tourism.findById(itemId);
      if (!item)
        return res.status(404).json({ message: "Tourism place not found" });

      totalPrice = item.entryFee * totalSeatsOrRooms;
    }

    const booking = await Booking.create({
      user: req.user.id,
      itemType,
      itemId,

      bookingDate,
      bookingTime,

      bookingFromDate,
      bookingFromTime,
      bookingToDate,
      bookingToTime,

      totalSeatsOrRooms,
      totalPrice,
    });

    res.status(201).json({
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    console.error("Create Booking Error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET MY BOOKINGS
 * Access: User
 * Route: GET /api/bookings/my
 */
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate("itemId")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error("Get My Bookings Error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET CLIENT BOOKINGS (ONLY OWN ITEMS)
 * Access: Client
 * Route: GET /api/bookings/client
 */
exports.getClientBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate({
        path: "itemId",
        match: { owner: req.user.id },
      })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    // Remove null populated items
    const filtered = bookings.filter((b) => b.itemId);

    res.json(filtered);
  } catch (error) {
    console.error("Get Client Bookings Error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET ALL BOOKINGS
 * Access: Admin
 * Route: GET /api/bookings
 */
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name email")
      .populate("itemId")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error("Get All Bookings Error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * UPDATE BOOKING STATUS
 * Access: Client / Admin
 * Route: PUT /api/bookings/:id/status
 */
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Confirmed", "Cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const booking = await Booking.findById(req.params.id).populate("itemId");

    if (!booking)
      return res.status(404).json({ message: "Booking not found" });

    if (
      req.user.role !== "admin" &&
      booking.itemId.owner.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    booking.status = status;
    await booking.save();

    res.json({
      message: "Booking status updated successfully",
      booking,
    });
  } catch (error) {
    console.error("Update Booking Status Error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * CANCEL BOOKING
 * Access: User
 * Route: PUT /api/bookings/:id/cancel
 */
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("itemId");

    if (!booking)
      return res.status(404).json({ message: "Booking not found" });

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (booking.status === "Cancelled") {
      return res.status(400).json({ message: "Booking already cancelled" });
    }

    // Restore event seats
    if (booking.itemType === "Event" && booking.status === "Confirmed") {
      booking.itemId.availableSeats += booking.totalSeatsOrRooms;
      await booking.itemId.save();
    }

    booking.status = "Cancelled";
    await booking.save();

    res.json({ message: "Booking cancelled successfully" });
  } catch (error) {
    console.error("Cancel Booking Error:", error);
    res.status(500).json({ message: error.message });
  }
};
