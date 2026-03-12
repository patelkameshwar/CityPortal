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

router.get("/", getAllEvents);

router.get("/:id", getEventById);

/**   ------------- PROTECTED ROUTES ----------------   */

router.post(
  "/",
  authMiddleware,
  roleMiddleware("client", "admin"),
  upload.array("images", 50),
  createEvent
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("client", "admin"),
  upload.array("images", 50),
  updateEvent
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("client", "admin"),
  deleteEvent
);

module.exports = router;
