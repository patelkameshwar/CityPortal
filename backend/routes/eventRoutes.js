const express = require("express");
const router = express.Router();

// Controllers
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

/**   ---------------- PUBLIC ROUTES ----------------   */

// Get all events
router.get("/", getAllEvents);

// Get single event
router.get("/:id", getEventById);

/**   ------------- PROTECTED ROUTES ----------------   */

// Create event (Client / Admin)
router.post(
  "/",
  authMiddleware,
  roleMiddleware("client", "admin"),
  upload.array("images", 5),
  createEvent
);

// Update event (Owner / Admin)
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("client", "admin"),
  upload.array("images", 5),
  updateEvent
);

// Delete event (Owner / Admin)
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("client", "admin"),
  deleteEvent
);

module.exports = router;
