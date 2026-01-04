const express = require("express");
const router = express.Router();

const {
  createBooking,
  getMyBookings,
  getClientBookings,
  getAllBookings,
  updateBookingStatus,
  cancelBooking,
} = require("../controllers/bookingController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

/**
 * ========================
 * USER ROUTES
 * ========================
 */

// Create booking (Hotel / Event / Tourism)
router.post(
  "/",
  authMiddleware,
  roleMiddleware("user"),
  createBooking
);

// Get logged-in user's bookings
router.get(
  "/my",
  authMiddleware,
  roleMiddleware("user"),
  getMyBookings
);

// Cancel own booking
router.put(
  "/cancel/:id",
  authMiddleware,
  roleMiddleware("user"),
  cancelBooking
);

/**
 * ========================
 * CLIENT ROUTES
 * ========================
 */

// Get bookings for items owned by client
router.get(
  "/client",
  authMiddleware,
  roleMiddleware("client"),
  getClientBookings
);

/**
 * ========================
 * ADMIN ROUTES
 * ========================
 */

// Get all bookings in system
router.get(
  "/admin",
  authMiddleware,
  roleMiddleware("admin"),
  getAllBookings
);

/**
 * ========================
 * CLIENT / ADMIN ROUTES
 * ========================
 */

// Approve or Reject booking
router.put(
  "/:id/status",
  authMiddleware,
  roleMiddleware("client", "admin"),
  updateBookingStatus
);

module.exports = router;
