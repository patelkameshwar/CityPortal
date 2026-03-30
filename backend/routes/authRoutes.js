const express = require("express");
const router = express.Router();

const { register, login, updateProfile, uploadProfilePicture, getProfile, forgotPassword, resetPasswordVerify, resetPassword } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const profileUpload = require("../middleware/profileUpload");

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.post("/profile-picture", authMiddleware, profileUpload.single("profilePicture"), uploadProfilePicture);

router.post("/forgot-password", forgotPassword);
router.get("/reset-password/:token", resetPasswordVerify);
router.put("/reset-password/:token", resetPassword);

module.exports = router;
