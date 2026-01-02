const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Admin only
router.get(
  "/admin",
  authMiddleware,
  roleMiddleware("admin"),
  (req, res) => {
    res.json({ message: "Welcome Admin" });
  }
);

// Client only
router.get(
  "/client",
  authMiddleware,
  roleMiddleware("client"),
  (req, res) => {
    res.json({ message: "Welcome Client" });
  }
);

// User only
router.get(
  "/user",
  authMiddleware,
  roleMiddleware("user"),
  (req, res) => {
    res.json({ message: "Welcome User" });
  }
);

module.exports = router;
