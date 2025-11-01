const asyncHandler = require("express-async-handler");
const Quote = require("../models/Quote");
const Customer = require("../models/Customer");
const Dealer = require("../models/Dealer");
const VehicleVariant = require("../models/VehicleVariant");
const Order = require("../models/Order");

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
    .populate("customer", "fullName email phone")
    .populate("dealer", "name")
    .populate({
      path: "items.variant",
      select: "trim msrp"
    })
    .populate({
      path: "items.color",
      select: "name code"
    });

  res.status(200).json(quotes);
});

const getQuoteById = asyncHandler(async (req, res) => {
  const quote = await Quote.findById(req.params.id)
    .populate("customer", "fullName email phone")
    .populate("dealer", "name")
    .populate({
      path: "items.variant",
      select: "trim msrp"
    })
    .populate({
      path: "items.color",
      select: "name code"
    });

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
  const { customer, items, subtotal, discount, total, validUntil, notes } = req.body;
  const dealer = req.user.dealer; // Lấy ID đại lý từ user đã đăng nhập

  if (!customer || !items || !items.length || !dealer) {
    res.status(400);
    throw new Error(
      "Vui lòng cung cấp đầy đủ: customer, items, dealer."
    );
  }

  // Kiểm tra tính hợp lệ của customer
  const customerExists = await Customer.findById(customer);
  if (!customerExists) {
    res.status(404);
    throw new Error("ID khách hàng không hợp lệ.");
  }

  // Kiểm tra tính hợp lệ của các variant trong items
  for (const item of items) {
    const variantExists = await VehicleVariant.findById(item.variant);
    if (!variantExists) {
      res.status(404);
      throw new Error(`ID variant ${item.variant} không hợp lệ.`);
    }
  }

  const newQuote = await Quote.create({
    customer,
    dealer,
    items,
    subtotal,
    discount,
    total,
    validUntil,
    notes,
    status: 'draft',
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
    .populate("customer", "fullName email phone")
    .populate("dealer", "name")
    .populate({
      path: "items.variant",
      select: "trim msrp"
    })
    .populate({
      path: "items.color",
      select: "name code"
    });

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

// Convert quote to order
module.exports.convertQuote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const quote = await Quote.findById(id);
  if (!quote) {
    res.status(404);
    throw new Error('Không tìm thấy báo giá.');
  }

  // Permission: DealerStaff can convert quotes of their dealer
  if (
    req.user.role !== 'Admin' &&
    req.user.role !== 'DealerManager' &&
    req.user.dealer?.toString() !== quote.dealer.toString()
  ) {
    res.status(403);
    throw new Error('Bạn không có quyền chuyển báo giá này.');
  }

  const orderItems = quote.items.map((it) => ({
    variant: it.variant,
    color: it.color,
    qty: it.qty || 1,
    unitPrice: it.unitPrice || 0,
  }));

  const order = await Order.create({
    dealer: quote.dealer,
    sales: req.user._id,
    customer: quote.customer,
    quote: quote._id,
    items: orderItems,
    paymentMethod: 'cash',
    deposit: 0,
    status: 'new',
  });

  quote.status = 'accepted';
  await quote.save();

  res.status(200).json({ message: 'Converted to order', orderId: order._id });
});
