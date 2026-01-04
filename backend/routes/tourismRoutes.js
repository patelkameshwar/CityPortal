const express = require("express");
const router = express.Router();

// Controllers
const {
  createTourism,
  getAllTourism,
  getTourismById,
  updateTourism,
  deleteTourism,
} = require("../controllers/tourismController");

// Middlewares
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Get all tourism places
router.get("/list", getAllTourism);

// Get single tourism place by ID
router.get("/:id", getTourismById);

// Add new tourism place
router.post(
  "/add",
  authMiddleware,
  roleMiddleware("client", "admin"),
  upload.array("images", 5),
  createTourism
);

// Update tourism place (owner client or admin)
router.put(
  "/update/:id",
  authMiddleware,
  roleMiddleware("client", "admin"),
  upload.array("images", 5),
  updateTourism
);

// Delete tourism place (owner client or admin)
router.delete(
  "/delete/:id",
  authMiddleware,
  roleMiddleware("client", "admin"),
  deleteTourism
);

module.exports = router;
