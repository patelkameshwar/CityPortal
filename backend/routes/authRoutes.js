const express = require("express");
const router = express.Router();

const { register, login, updateProfile, uploadProfilePicture, getProfile } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const profileUpload = require("../middleware/profileUpload");

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.post("/profile-picture", authMiddleware, profileUpload.single("profilePicture"), uploadProfilePicture);

module.exports = router;
