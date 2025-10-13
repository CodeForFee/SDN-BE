const express = require("express");
const router = express.Router();
const {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
} = require("../controllers/BookingController");
const { protect } = require("../middleware/authMiddleware");

// Tạo lịch hẹn lái thử (Dealer Staff, Dealer Manager)
router.post("/", protect, createBooking);

// Lấy tất cả lịch hẹn (Admin, EVM Staff, Dealer Manager)
router.get("/", protect, getBookings);

// Lấy 1 lịch hẹn
router.get("/:id", protect, getBookingById);

// Cập nhật lịch hẹn
router.put("/:id", protect, updateBooking);

// Xóa lịch hẹn
router.delete("/:id", protect, deleteBooking);

module.exports = router;
