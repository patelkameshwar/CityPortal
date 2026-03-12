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
router.get("/", getAllTourism);

router.get("/:id", getTourismById);

// ================= CLIENT / ADMIN ROUTES =================
router.post(
  "/",
  authMiddleware,
  roleMiddleware("client", "admin"),
  upload.array("images", 50),
  createTourism
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("client", "admin"),
  upload.array("images", 50),
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
