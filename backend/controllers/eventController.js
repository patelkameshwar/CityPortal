const Event = require("../models/Event");
const Booking = require("../models/Booking");

/**
 * CREATE EVENT
 * Access: Client / Admin
 * Route: POST /api/events
 */
exports.createEvent = async (req, res) => {
  try {
    const { title, location, description, eventDate, eventTime, totalSeats, price } = req.body;

    if (!eventDate || !eventTime) {
      return res.status(400).json({ success: false, message: "Event date and time are required" });
    }

    const images = req.files ? req.files.map(file => file.path) : [];

    const event = await Event.create({
      title,
      location,
      description,
      eventDate,
      eventTime,
      totalSeats,
      availableSeats: totalSeats,
      price,
      images,
      owner: req.user.id,
      bookings: [],
    });

    res.status(201).json({ success: true, message: "Event created successfully", event });
  } catch (error) {
    console.error("Create Event Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET ALL EVENTS
 * Access: Public
 * Route: GET /api/events
 */
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, events });
  } catch (error) {
    console.error("Get All Events Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET SINGLE EVENT
 * Access: Public
 * Route: GET /api/events/:id
 */
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("owner", "name email")
      .populate("bookings.user", "name email");

    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    res.status(200).json({ success: true, event });
  } catch (error) {
    console.error("Get Event Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * UPDATE EVENT
 * Access: Owner / Admin
 * Route: PUT /api/events/:id
 */
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    if (req.user.role !== "admin" && event.owner.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: "Not authorized" });

    const images = req.files?.length ? req.files.map(file => file.path) : event.images;

    // Update total seats safely
    if (req.body.totalSeats) {
      const usedSeats = event.totalSeats - event.availableSeats;
      event.totalSeats = req.body.totalSeats;
      event.availableSeats = Math.max(req.body.totalSeats - usedSeats, 0);
    }

    // Update fields
    event.title = req.body.title || event.title;
    event.location = req.body.location || event.location;
    event.description = req.body.description || event.description;
    event.eventDate = req.body.eventDate || event.eventDate;
    event.eventTime = req.body.eventTime || event.eventTime;
    event.price = req.body.price || event.price;
    event.images = images;

    await event.save();

    res.status(200).json({ success: true, message: "Event updated successfully", event });
  } catch (error) {
    console.error("Update Event Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * DELETE EVENT
 * Access: Owner / Admin
 * Route: DELETE /api/events/:id
 */
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    if (req.user.role !== "admin" && event.owner.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: "Not authorized" });

    // Cancel all related bookings
    await Booking.updateMany({ itemType: "Event", itemId: event._id }, { status: "Cancelled" });

    await event.deleteOne();

    res.status(200).json({ success: true, message: "Event deleted successfully" });
  } catch (error) {
    console.error("Delete Event Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * ADD BOOKING TO EVENT
 * Access: User
 * Route: POST /api/events/:id/book
 */
exports.bookEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    const { seats } = req.body;
    if (!seats || seats < 1) return res.status(400).json({ success: false, message: "Seats required" });

    if (seats > event.availableSeats)
      return res.status(400).json({ success: false, message: "Not enough seats available" });

    // Add booking entry
    event.bookings.push({ user: req.user.id, seats });
    event.availableSeats -= seats;

    await event.save();

    res.status(200).json({ success: true, message: "Event booked successfully", event });
  } catch (error) {
    console.error("Book Event Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
