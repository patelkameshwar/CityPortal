const express = require("express");
const router = express.Router();

const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} = require("../controllers/eventController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Public
router.get("/", getAllEvents);
router.get("/:id", getEventById);

// Protected
router.post(
  "/",
  authMiddleware,
  roleMiddleware("client", "admin"),
  upload.array("images", 5),
  createEvent
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("client", "admin"),
  upload.array("images", 5),
  updateEvent
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("client", "admin"),
  deleteEvent
);

module.exports = router;
