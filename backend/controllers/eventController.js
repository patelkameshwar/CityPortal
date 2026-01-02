const Event = require("../models/Event");

/**
 * CREATE EVENT
 * Client / Admin
 */
exports.createEvent = async (req, res) => {
  try {
    const {
      title,
      location,
      description,
      eventDate,
      totalSeats,
      price,
    } = req.body;

    const images = req.files.map((file) => file.path);

    const event = await Event.create({
      title,
      location,
      description,
      eventDate,
      totalSeats,
      availableSeats: totalSeats, // initially same
      price,
      images,
      owner: req.user.id,
    });

    res.status(201).json({
      message: "Event created successfully",
      event,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET ALL EVENTS (PUBLIC)
 */
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET SINGLE EVENT
 */
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      "owner",
      "name email"
    );

    if (!event)
      return res.status(404).json({ message: "Event not found" });

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * UPDATE EVENT
 * Owner / Admin
 */
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event)
      return res.status(404).json({ message: "Event not found" });

    // Ownership check
    if (
      req.user.role !== "admin" &&
      event.owner.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const images =
      req.files?.length > 0
        ? req.files.map((file) => file.path)
        : event.images;

    event.title = req.body.title || event.title;
    event.location = req.body.location || event.location;
    event.description = req.body.description || event.description;
    event.eventDate = req.body.eventDate || event.eventDate;
    event.totalSeats = req.body.totalSeats || event.totalSeats;
    event.price = req.body.price || event.price;
    event.images = images;

    // If total seats updated, adjust available seats carefully
    if (req.body.totalSeats) {
      const usedSeats =
        event.totalSeats - event.availableSeats;
      event.availableSeats =
        req.body.totalSeats - usedSeats;
    }

    await event.save();

    res.json({ message: "Event updated", event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * DELETE EVENT
 * Owner / Admin
 */
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event)
      return res.status(404).json({ message: "Event not found" });

    if (
      req.user.role !== "admin" &&
      event.owner.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await event.deleteOne();
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
