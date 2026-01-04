const express = require("express");
const router = express.Router();

// Controllers
const {
  createTourism,
  getAllTourism,
  getTourismById,
  updateTourism,
  deleteTourism,
  bookTourism, // booking endpoint
} = require("../controllers/tourismController");

// Middlewares
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Public Routes
router.get("/list", getAllTourism);           // Get all tourism places
router.get("/:id", getTourismById);          // Get single tourism place by ID

// Protected Routes - Client/Admin
router.post(
  "/add",
  authMiddleware,
  roleMiddleware("client", "admin"),
  upload.array("images", 5),
  createTourism
);

router.put(
  "/update/:id",
  authMiddleware,
  roleMiddleware("client", "admin"),
  upload.array("images", 5),
  updateTourism
);

router.delete(
  "/delete/:id",
  authMiddleware,
  roleMiddleware("client", "admin"),
  deleteTourism
);

// Booking Route - User
router.post(
  "/book/:tourismId",
  authMiddleware,
  roleMiddleware("user"), // Only users can book
  bookTourism
);

module.exports = router;
