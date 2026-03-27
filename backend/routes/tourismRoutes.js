const express = require("express");
const router = express.Router();

// Controllers
const {
  createTourism,
  getAllTourism,
  getTourismById,
  getSimilarTourism,
  updateTourism,
  deleteTourism,
  bookTourism,
} = require("../controllers/tourismController");

// Middlewares
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const createUpload = require("../middleware/uploadMiddleware");

// ================= PUBLIC ROUTES =================
router.get("/", getAllTourism);

router.get("/:id", getTourismById);
router.get("/:id/similar", getSimilarTourism);

// ================= CLIENT / ADMIN ROUTES =================
router.post(
  "/",
  authMiddleware,
  roleMiddleware("client", "admin"),
  createUpload("tourism").array("images", 50),
  createTourism
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("client", "admin"),
  createUpload("tourism").array("images", 50),
  updateTourism
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("client", "admin"),
  deleteTourism
);

// ================= USER BOOKING ROUTE =================
router.post(
  "/:id/book",
  authMiddleware,
  roleMiddleware("user"),
  bookTourism
);

module.exports = router;
