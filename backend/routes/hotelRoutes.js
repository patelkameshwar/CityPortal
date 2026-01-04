const express = require("express");
const router = express.Router();

// Controllers
const {
  createHotel,
  getAllHotels,
  getHotelById,
  updateHotel,
  deleteHotel,
} = require("../controllers/hotelController");

// Middlewares
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Get all hotels
router.get("/list", getAllHotels);

// Get single hotel by ID
router.get("/:id", getHotelById);

// Add hotel
router.post(
  "/add",
  authMiddleware,
  roleMiddleware("client", "admin"),
  upload.array("images", 5),
  createHotel
);

// Update hotel (only owner client or admin)
router.put(
  "/update/:id",
  authMiddleware,
  roleMiddleware("client", "admin"),
  upload.array("images", 5),
  updateHotel
);

// Delete hotel (only owner client or admin)
router.delete(
  "/delete/:id",
  authMiddleware,
  roleMiddleware("client", "admin"),
  deleteHotel
);

module.exports = router;
