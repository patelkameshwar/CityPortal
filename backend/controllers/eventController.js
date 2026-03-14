const Event = require("../models/Event");
const Booking = require("../models/Booking");

/*
 * CREATE EVENT
 * Access: Client / Admin
 */
exports.createEvent = async (req, res) => {
  try {
console.log('Event files received:', req.files, req.file);
    
    // Handle fields() format: req.files = {images: [file1, ...]}
    const imagesArray = req.files || (req.file ? [req.file] : []);
    if (imagesArray.length > 50) {
      return res.status(400).json({ success: false, message: "Maximum 50 images allowed" });
    }

    const { title, location, description, eventType, eventDate, bookingFromDate, bookingToDate, eventTime, totalSeats, price } = req.body;

    if (!title || !location || !eventTime || !totalSeats || !price) {
      return res.status(400).json({ success: false, message: "All required fields must be provided" });
    }

    let fromDate, toDate, eventDateObj;
    
    if (eventType === 'one-day') {
      if (!eventDate) {
        return res.status(400).json({ success: false, message: 'eventDate is required for one-day events' });
      }
      eventDateObj = new Date(eventDate);
      if (isNaN(eventDateObj.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid eventDate' });
      }
      fromDate = toDate = eventDateObj;
    } else if (eventType === 'multi-day') {
      if (!bookingFromDate || !bookingToDate) {
        return res.status(400).json({ success: false, message: 'bookingFromDate and bookingToDate are required for multi-day events' });
      }
      fromDate = new Date(bookingFromDate);
      toDate = new Date(bookingToDate);
      if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid booking dates' });
      }
      if (fromDate > toDate) {
        return res.status(400).json({ success: false, message: 'bookingToDate must be after or same as bookingFromDate' });
      }
    } else {
      return res.status(400).json({ success: false, message: 'Invalid eventType. Use "one-day" or "multi-day"' });
    }

    const images = imagesArray.map(file => file.path);

    const event = await Event.create({
      title,
      location,
      description,
      eventDate: eventType === 'one-day' ? eventDateObj : undefined,
      bookingFromDate: fromDate,
      bookingToDate: toDate,
      eventTime,
      totalSeats,
      owner: req.user.id,
      price,
      images,
      bookings: [], 
    });

    res.status(201).json({ success: true, message: "Event created successfully", event });
  } catch (error) {
    console.error("Create Event Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/*
 * GET ALL EVENTS
 * Access: Public
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

/*
 * GET SINGLE EVENT
 * Access: Public
 */
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("owner", "name email")
      .populate("bookings.user", "name email");

    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    // Optional: Return remaining seats per day
    const today = new Date();
    const eventDates = [];
    for (let d = new Date(event.bookingFromDate); d <= event.bookingToDate; d.setDate(d.getDate() + 1)) {
      const dateCopy = new Date(d);
      const bookedSeats = event.bookings
        .filter(b => b.bookingDate.toDateString() === dateCopy.toDateString())
        .reduce((sum, b) => sum + b.seats, 0);
      eventDates.push({
        date: dateCopy.toDateString(),
        remainingSeats: event.totalSeats - bookedSeats
      });
    }

    res.status(200).json({ success: true, event, eventDates });
  } catch (error) {
    console.error("Get Event Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * UPDATE EVENT
 * Access: Owner / Admin
 */
exports.updateEvent = async (req, res) => {
  try {
    const updateImagesArray = req.files || (req.file ? [req.file] : []);
    console.log('Update event files received:', updateImagesArray.length);
    
    if (updateImagesArray.length > 50) {
      return res.status(400).json({ success: false, message: "Maximum 50 images allowed" });
    }

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    if (req.user.role !== "admin" && event.owner.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: "Not authorized" });

    const images = req.files ? req.files.map(file => file.path) : (req.file ? [req.file.path] : event.images);

    // Update fields safely
    event.title = req.body.title || event.title;
    event.location = req.body.location || event.location;
    event.description = req.body.description || event.description;
    event.eventTime = req.body.eventTime || event.eventTime;
    event.price = req.body.price || event.price;
    event.images = images;

    // Update totalSeats safely
    if (req.body.totalSeats) {
      const bookedSeats = event.bookings.reduce((sum, b) => sum + b.seats, 0);
      if (req.body.totalSeats < bookedSeats) {
        return res.status(400).json({ success: false, message: "Total seats cannot be less than already booked seats" });
      }
      event.totalSeats = req.body.totalSeats;
    }

    // Update booking dates
    if (req.body.bookingFromDate) event.bookingFromDate = new Date(req.body.bookingFromDate);
    if (req.body.bookingToDate) event.bookingToDate = new Date(req.body.bookingToDate);

    if (event.bookingFromDate > event.bookingToDate) {
      return res.status(400).json({ success: false, message: "End date must be after start date" });
    }

    await event.save();

    res.status(200).json({ success: true, message: "Event updated successfully", event });
  } catch (error) {
    console.error("Update Event Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/*
 * DELETE EVENT
 * Access: Owner / Admin
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

/*
 * BOOK EVENT
 * Access: User
 */
exports.bookEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event)
      return res.status(400).json({ success: false, message: "Event not found" });

    const { seats, bookingDate } = req.body;

    if (!seats || seats < 1)
      return res.status(400).json({ success: false, message: "Seats required" });

    if (!bookingDate)
      return res.status(400).json({ success: false, message: "Booking date required" });

    const date = new Date(bookingDate);
    if (date < event.bookingFromDate || date > event.bookingToDate) {
      return res.status(400).json({ success: false, message: "Booking date must be within event dates" });
    }

    // Calculate already booked seats on that day
    const bookedSeats = event.bookings
      .filter(b => b.bookingDate.toDateString() === date.toDateString())
      .reduce((sum, b) => sum + b.seats, 0);

    if (bookedSeats + seats > event.totalSeats)
      return res.status(400).json({ success: false, message: "Not enough seats available on this date" });

    event.bookings.push({ user: req.user.id, seats, bookingDate: date });

    await event.save();

    res.status(200).json({ success: true, message: "Event booked successfully", event });
  } catch (error) {
    console.error("Book Event Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

