const express = require("express");
const router = express.Router();
const { register, login, me } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/login", login);

// register chỉ dành cho Admin → gọi protect trước
router.post("/register", protect, register);

// Đổi getProfile thành me
router.get("/me", protect, me);

module.exports = router;
