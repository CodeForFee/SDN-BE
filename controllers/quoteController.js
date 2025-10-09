const asyncHandler = require("express-async-handler");
const Quote = require("../model/Quote");
const Customer = require("../model/Customer");
const Dealer = require("../model/Dealer");
const Vehicle = require("../model/Vehicle");

const getQuotes = asyncHandler(async (req, res) => {
  let filter = {};
  const userRole = req.user.role;

  // Lọc theo Dealer
  if (userRole === "Dealer Staff" || userRole === "Dealer Manager") {
    if (req.user.dealer) {
      // Giả định req.user.dealer là ID của đại lý
      filter.dealer = req.user.dealer;
    } else {
      res.status(400);
      throw new Error("Tài khoản đại lý chưa được liên kết với đại lý nào.");
    }
  }

  const quotes = await Quote.find(filter)
    .populate("Customer", "name email phone")
    .populate("Dealer", "name")
    .populate("Vehicle", "name model year price");

  res.status(200).json(quotes);
});

const getQuoteById = asyncHandler(async (req, res) => {
  const quote = await Quote.findById(req.params.id)
    .populate("Customer", "name email phone")
    .populate("Dealer", "name")
    .populate("Vehicle", "name model year price");

  if (!quote) {
    res.status(404);
    throw new Error("Không tìm thấy báo giá.");
  }

  // Kiểm tra quyền: Dealer Staff/Manager chỉ được xem báo giá của dealer mình
  const userRole = req.user.role;
  if (
    (userRole === "Dealer Staff" || userRole === "Dealer Manager") &&
    req.user.dealer.toString() !== quote.dealer._id.toString()
  ) {
    res.status(403);
    throw new Error("Bạn không có quyền xem báo giá này.");
  }

  res.status(200).json(quote);
});

const createQuote = asyncHandler(async (req, res) => {
  const { customer, vehicle, quotedPrice, validUntil, notes } = req.body;
  const dealer = req.user.dealer; // Lấy ID đại lý từ user đã đăng nhập

  if (!customer || !vehicle || !quotedPrice || !dealer) {
    res.status(400);
    throw new Error(
      "Vui lòng cung cấp đầy đủ: customer, vehicle, quotedPrice."
    );
  }

  // Kiểm tra tính hợp lệ của các ID
  const [customerExists, vehicleExists] = await Promise.all([
    Customer.findById(customer),
    Vehicle.findById(vehicle),
  ]);

  if (!customerExists) {
    res.status(404);
    throw new Error("ID khách hàng không hợp lệ.");
  }
  if (!vehicleExists) {
    res.status(404);
    throw new Error("ID xe không hợp lệ.");
  }

  const newQuote = await Quote.create({
    customer,
    dealer,
    vehicle,
    quotedPrice,
    validUntil,
    notes,
    // status mặc định là 'Active'
  });

  res.status(201).json(newQuote);
});

const updateQuote = asyncHandler(async (req, res) => {
  const { quotedPrice, validUntil, status, notes } = req.body;

  const quote = await Quote.findById(req.params.id);

  if (!quote) {
    res.status(404);
    throw new Error("Không tìm thấy báo giá.");
  }

  // Kiểm tra quyền sở hữu (Chỉ Dealer Manager của Dealer đó mới được cập nhật)
  if (
    req.user.role !== "Admin" &&
    req.user.dealer.toString() !== quote.dealer.toString()
  ) {
    res.status(403);
    throw new Error("Bạn không có quyền cập nhật báo giá này.");
  }

  // Xây dựng đối tượng cập nhật
  const updateFields = {
    ...(quotedPrice !== undefined && { quotedPrice }),
    ...(validUntil !== undefined && { validUntil }),
    ...(status !== undefined && { status }),
    ...(notes !== undefined && { notes }),
  };

  // Nếu không có gì để cập nhật
  if (Object.keys(updateFields).length === 0) {
    res.status(400);
    throw new Error("Vui lòng cung cấp ít nhất một trường để cập nhật.");
  }

  const updatedQuote = await Quote.findByIdAndUpdate(
    req.params.id,
    updateFields,
    { new: true, runValidators: true }
  )
    .populate("Customer")
    .populate("Dealer")
    .populate("Vehicle");

  res.status(200).json(updatedQuote);
});

const deleteQuote = asyncHandler(async (req, res) => {
  const quote = await Quote.findById(req.params.id);

  if (!quote) {
    res.status(404);
    throw new Error("Không tìm thấy báo giá.");
  }

  // Kiểm tra quyền sở hữu (Chỉ Dealer Manager của Dealer đó mới được xóa)
  if (
    req.user.role !== "Admin" &&
    req.user.dealer.toString() !== quote.dealer.toString()
  ) {
    res.status(403);
    throw new Error("Bạn không có quyền xóa báo giá này.");
  }

  await Quote.deleteOne({ _id: req.params.id });

  res.status(200).json({ message: "Báo giá đã được xóa thành công." });
});

module.exports = {
  getQuotes,
  getQuoteById,
  createQuote,
  updateQuote,
  deleteQuote,
};
