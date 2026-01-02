const express = require("express");
const router = express.Router();

const {
  createHotel,
  getAllHotels,
  getHotelById,
  updateHotel,
  deleteHotel,
} = require("../controllers/hotelController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Public
router.get("/", getAllHotels);
router.get("/:id", getHotelById);

// Protected
router.post(
  "/",
  authMiddleware,
  roleMiddleware("client", "admin"),
  upload.array("images", 5),
  createHotel
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("client", "admin"),
  upload.array("images", 5),
  updateHotel
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("client", "admin"),
  deleteHotel
);

module.exports = router;
