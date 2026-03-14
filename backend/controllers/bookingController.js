const Booking = require("../models/Booking");
const Event = require("../models/Event");
const Hotel = require("../models/Hotel");
const Tourism = require("../models/Tourism");

/*
 * CREATE BOOKING
 * Access: User
 */
exports.createBooking = async (req, res) => {
  try {
    const {
      itemType,
      itemId,
      bookingDate,        // Event / Tourism
      bookingTime,        // Event / Tourism
      bookingFromDate,    // Hotel
      bookingFromTime,    // Hotel
      bookingToDate,      // Hotel
      bookingToTime,      // Hotel
      totalQuantity,      // Rooms or seats
    } = req.body;

    if (!itemType || !itemId || !totalQuantity) {
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

  if (!bookingDate) {
    return res.status(400).json({ message: "Booking date required for Event" });
  }

  const date = new Date(bookingDate);
  const from = new Date(item.bookingFromDate);
  const to = new Date(item.bookingToDate);

  // Validate bookingDate is within event date range
  if (date < from || date > to) {
    return res.status(400).json({
      message: "Booking date must be within event dates",
    });
  }

  // Calculate seats already booked for that day
  const bookedSeats = item.bookings
    .filter(b => b.bookingDate.toDateString() === date.toDateString())
    .reduce((sum, b) => sum + b.seats, 0);

  if (bookedSeats + totalQuantity > item.totalSeats) {
    return res.status(400).json({
      message: "Not enough seats available on this date",
    });
  }

  totalPrice = item.price * totalQuantity;

  // Add booking entry to event bookings array
  item.bookings.push({ user: req.user.id, seats: totalQuantity, bookingDate: date });

  await item.save();
}


    // ================= HOTEL BOOKING =================
    if (itemType === "Hotel") {
  item = await Hotel.findById(itemId);
  if (!item) {
    return res.status(404).json({ message: "Hotel not found" });
  }

  if (!bookingFromDate || !bookingToDate) {
    return res
      .status(400)
      .json({ message: "Check-in and check-out dates required for Hotel" });
  }

  // Normalize dates (remove time)
  const from = new Date(bookingFromDate);
  const to = new Date(bookingToDate);
  from.setHours(0, 0, 0, 0);
  to.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Validate dates
  if (from >= to) {
    return res.status(400).json({ message: "Invalid hotel booking dates" });
  }

  if (from < today) {
    return res.status(400).json({ message: "Cannot book past dates" });
  }

  // Hotel availability window
  const hotelFrom = new Date(item.bookingFromDate);
  const hotelTo = new Date(item.bookingToDate);
  hotelFrom.setHours(0, 0, 0, 0);
  hotelTo.setHours(0, 0, 0, 0);

  if (from < hotelFrom || to > hotelTo) {
    return res
      .status(400)
      .json({ message: "Hotel not available for selected dates" });
  }

  // ✅ Correct overlap logic
  const existingBookings = await Booking.find({
    itemType: "Hotel",
    itemId: itemId,
    status: "Confirmed",
    bookingFromDate: { $lt: to },
    bookingToDate: { $gt: from },
  });

  let roomsBooked = 0;
  existingBookings.forEach(b => {
    roomsBooked += b.totalQuantity;
  });

  if (roomsBooked + totalQuantity > item.totalRooms) {
    return res
      .status(400)
      .json({ message: "Not enough rooms available for selected dates" });
  }

  // Calculate total nights
  const nights = Math.ceil(
    (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)
  );

  totalPrice = nights * item.pricePerNight * totalQuantity;
}


    // ================= TOURISM BOOKING =================
    if (itemType === "Tourism") {
      item = await Tourism.findById(itemId);
      if (!item)
        return res.status(404).json({ message: "Tourism place not found" });

      if (!bookingDate || !bookingTime) {
        return res.status(400).json({ message: "Booking date & time required for Tourism" });
      }

      const tourDate = new Date(bookingDate);
      if (tourDate < item.bookingFromDate || tourDate > item.bookingToDate) {
        return res.status(400).json({ message: "Tourism place not available on this date" });
      }

      if (item.availableVisitors < totalQuantity) {
        return res.status(400).json({ message: "Not enough slots available" });
      }

      totalPrice = item.entryFee * totalQuantity;

      // Reduce available visitors
      item.availableVisitors -= totalQuantity;
      await item.save();
    }

    // ================= CREATE BOOKING =================
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
      totalQuantity,
      totalPrice,
      status: "Confirmed",
    });

    // Update hotel bookings array after creation (Hotel only)
    if (itemType === "Hotel") {
      const hotel = await Hotel.findById(itemId);
      if (hotel) {
        hotel.bookings.push(booking._id);
        await hotel.save();
      }
    }

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
 */
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate("itemId")
      .sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (error) {
    console.error("Get My Bookings Error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET CLIENT BOOKINGS (ONLY OWN ITEMS)
 * Access: Client
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

    const filtered = bookings.filter(b => b.itemId); // remove nulls
    res.json(filtered);
  } catch (error) {
    console.error("Get Client Bookings Error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET ALL BOOKINGS
 * Access: Admin
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

    if (req.user.role !== "admin" && booking.itemId.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    booking.status = status;
    await booking.save();

    res.json({ message: "Booking status updated successfully", booking });
  } catch (error) {
    console.error("Update Booking Status Error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * CANCEL BOOKING
 * Access: User
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

    // Restore availability if it was confirmed
    if (booking.status === "Confirmed") {
      if (booking.itemType === "Event") {
        booking.itemId.availableSeats += booking.totalQuantity;
        await booking.itemId.save();
      } else if (booking.itemType === "Tourism") {
        booking.itemId.availableVisitors += booking.totalQuantity;
        await booking.itemId.save();
      }
    }

    booking.status = "Cancelled";
    await booking.save();

    res.json({ message: "Booking cancelled successfully" });
  } catch (error) {
    console.error("Cancel Booking Error:", error);
    res.status(500).json({ message: error.message });
  }
};
