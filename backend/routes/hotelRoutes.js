const express = require("express");
const router = express.Router();

// Controllers
const {
  createHotel,
  getAllHotels,
  getHotelById,
  updateHotel,
  deleteHotel,
  getSimilarHotels,
} = require("../controllers/hotelController");

// Middlewares
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const createUpload = require("../middleware/uploadMiddleware");

/**
 * PUBLIC ROUTES
 */
router.get("/", getAllHotels);

router.get("/:id", getHotelById);

router.get("/:id/similar", getSimilarHotels);

/**
 * PROTECTED ROUTES (CLIENT / ADMIN)
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware("client", "admin"),
  createUpload("hotels").array("images", 50),
  createHotel
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("client", "admin"),
  createUpload("hotels").array("images", 50),
  updateHotel
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("client", "admin"),
  deleteHotel
);

module.exports = router;
