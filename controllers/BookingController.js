const asyncHandler = require("express-async-handler");
const Booking = require("../model/Booking");
const Customer = require("../model/Customer");
const Vehicle = require("../model/Vehicle");

// @desc    Tạo lịch hẹn lái thử
// @route   POST /api/bookings
// @access  Protected
const createBooking = asyncHandler(async (req, res) => {
  const { customer, vehicle, testDriveDate } = req.body;

  if (!customer || !vehicle || !testDriveDate) {
    res.status(400);
    throw new Error("Vui lòng cung cấp customer, vehicle và testDriveDate");
  }

  // Kiểm tra customer tồn tại
  const customerExists = await Customer.findById(customer);
  if (!customerExists) {
    res.status(404);
    throw new Error("Khách hàng không tồn tại");
  }

  // Kiểm tra vehicle tồn tại
  const vehicleExists = await Vehicle.findById(vehicle);
  if (!vehicleExists) {
    res.status(404);
    throw new Error("Phương tiện không tồn tại");
  }

  const booking = await Booking.create({
    customer,
    vehicle,
    testDriveDate,
  });

  res.status(201).json(booking);
});

// @desc    Lấy tất cả lịch hẹn
// @route   GET /api/bookings
// @access  Protected
const getBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find()
    .populate("customer", "name email") // populate customer thông tin
    .populate("vehicle", "model brand"); // populate vehicle thông tin

  res.json(bookings);
});

// @desc    Lấy lịch hẹn theo id
// @route   GET /api/bookings/:id
// @access  Protected
const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate("customer", "name email")
    .populate("vehicle", "model brand");

  if (!booking) {
    res.status(404);
    throw new Error("Không tìm thấy lịch hẹn");
  }

  res.json(booking);
});

// @desc    Cập nhật lịch hẹn
// @route   PUT /api/bookings/:id
// @access  Protected
const updateBooking = asyncHandler(async (req, res) => {
  const { testDriveDate, status } = req.body;

  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error("Không tìm thấy lịch hẹn");
  }

  if (testDriveDate) booking.testDriveDate = testDriveDate;
  if (status) booking.status = status;

  const updatedBooking = await booking.save();
  res.json(updatedBooking);
});

// @desc    Xóa lịch hẹn
// @route   DELETE /api/bookings/:id
// @access  Protected
const deleteBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findByIdAndDelete(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error("Không tìm thấy lịch hẹn");
  }

  res.json({ message: "Đã xóa lịch hẹn" });
});

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
};
