const express = require("express");
const router = express.Router();

// Controllers
const {
  createTourism,
  getAllTourism,
  getTourismById,
  updateTourism,
  deleteTourism,
  bookTourism,
} = require("../controllers/tourismController");

// Middlewares
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

// ================= PUBLIC ROUTES =================
// Get all tourism places
// GET /api/tourism
router.get("/", getAllTourism);

// Get single tourism place by ID
// GET /api/tourism/:id
router.get("/:id", getTourismById);

// ================= CLIENT / ADMIN ROUTES =================
// Create tourism place
// POST /api/tourism
router.post(
  "/",
  authMiddleware,
  roleMiddleware("client", "admin"),
  upload.array("images", 5),
  createTourism
);

// Update tourism place
// PUT /api/tourism/:id
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("client", "admin"),
  upload.array("images", 5),
  updateTourism
);

// Delete tourism place
// DELETE /api/tourism/:id
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("client", "admin"),
  deleteTourism
);

// ================= USER BOOKING ROUTE =================
// Book a tourism place
// POST /api/tourism/:id/book
router.post(
  "/:id/book",
  authMiddleware,
  roleMiddleware("user"), // Only users can book
  bookTourism
);

module.exports = router;
