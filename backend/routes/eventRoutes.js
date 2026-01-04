const express = require("express");
const router = express.Router();

const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} = require("../controllers/eventController");

// Middlewares
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Get all events
router.get("/list", getAllEvents);

// Get single event by ID
router.get("/:id", getEventById);

// Add new event
router.post(
  "/add",
  authMiddleware,
  roleMiddleware("client", "admin"),
  upload.array("images", 5),
  createEvent
);

// Update event (only owner client or admin)
router.put(
  "/update/:id",
  authMiddleware,
  roleMiddleware("client", "admin"),
  upload.array("images", 5),
  updateEvent
);

// Delete event (only owner client or admin)
router.delete(
  "/delete/:id",
  authMiddleware,
  roleMiddleware("client", "admin"),
  deleteEvent
);

module.exports = router;