const express = require("express");
const router = express.Router();

const {
  createTourism,
  getAllTourism,
  getTourismById,
  updateTourism,
  deleteTourism,
} = require("../controllers/tourismController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Public
router.get("/", getAllTourism);
router.get("/:id", getTourismById);

// Protected
router.post(
  "/",
  authMiddleware,
  roleMiddleware("client", "admin"),
  upload.array("images", 5),
  createTourism
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("client", "admin"),
  upload.array("images", 5),
  updateTourism
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("client", "admin"),
  deleteTourism
);

module.exports = router;
