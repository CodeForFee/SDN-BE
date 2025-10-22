const Order = require("../models/Order");
const Customer = require("../models/Customer");
const Dealer = require("../models/Dealer");
const VehicleVariant = require("../models/VehicleVariant");

// @desc Get all orders
exports.getOrders = async (req, res) => {
  try {
    let filter = {};
    const userRole = req.user.role;

    // Dealer Staff/Manager chỉ xem orders của dealer mình
    if (userRole === "Dealer Staff" || userRole === "Dealer Manager") {
      if (req.user.dealer) {
        filter.dealer = req.user.dealer;
      } else {
        return res.status(400).json({ 
          message: "Tài khoản đại lý chưa được liên kết với đại lý nào." 
        });
      }
    }

    const orders = await Order.find(filter)
      .populate("customer", "fullName email phone")
      .populate("dealer", "name address")
      .populate({
        path: "items.variant",
        select: "trim msrp"
      })
      .populate({
        path: "items.color",
        select: "name code"
      });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate("customer", "fullName email phone")
      .populate("dealer", "name address")
      .populate({
        path: "items.variant",
        select: "trim msrp"
      })
      .populate({
        path: "items.color",
        select: "name code"
      });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Kiểm tra quyền xem order
    const userRole = req.user.role;
    if (
      (userRole === "Dealer Staff" || userRole === "Dealer Manager") &&
      req.user.dealer.toString() !== order.dealer._id.toString()
    ) {
      return res.status(403).json({ message: "Bạn không có quyền xem order này." });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Create new order
exports.createOrder = async (req, res) => {
  try {
    const { customer, items, paymentMethod, deposit } = req.body;
    const dealer = req.user.dealer; // Lấy ID đại lý từ user đã đăng nhập

    if (!customer || !items || !items.length || !dealer) {
      return res.status(400).json({ 
        message: "Vui lòng cung cấp đầy đủ: customer, items." 
      });
    }

    // Kiểm tra tính hợp lệ của customer
    const customerExists = await Customer.findById(customer);
    if (!customerExists) {
      return res.status(404).json({ message: "ID khách hàng không hợp lệ." });
    }

    // Kiểm tra tính hợp lệ của các variant trong items
    for (const item of items) {
      const variantExists = await VehicleVariant.findById(item.variant);
      if (!variantExists) {
        return res.status(404).json({ message: `ID variant ${item.variant} không hợp lệ.` });
      }
    }

    // Generate order number
    const orderCount = await Order.countDocuments();
    const orderNo = `ORD-${new Date().getFullYear()}-${String(orderCount + 1).padStart(3, '0')}`;

    const newOrder = await Order.create({
      orderNo,
      customer,
      dealer,
      items,
      paymentMethod: paymentMethod || "cash",
      deposit: deposit || 0,
      status: "new",
    });

    const populatedOrder = await Order.findById(newOrder._id)
      .populate("customer", "fullName email phone")
      .populate("dealer", "name address")
      .populate({
        path: "items.variant",
        select: "trim msrp"
      })
      .populate({
        path: "items.color",
        select: "name code"
      });

    res.status(201).json({
      message: "Create new order successfully",
      data: populatedOrder,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update order
exports.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentType, amount } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Kiểm tra quyền cập nhật (chỉ Dealer Manager và Admin)
    const userRole = req.user.role;
    if (
      userRole !== "Admin" &&
      userRole !== "Dealer Manager" &&
      req.user.dealer.toString() !== order.dealer.toString()
    ) {
      return res.status(403).json({ message: "Bạn không có quyền cập nhật order này." });
    }

    const updateFields = {};
    if (status !== undefined) updateFields.status = status;
    if (paymentType !== undefined) updateFields.paymentType = paymentType;
    if (amount !== undefined) updateFields.amount = amount;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ 
        message: "Vui lòng cung cấp ít nhất một trường để cập nhật." 
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: true }
    )
      .populate("customer", "fullName email phone")
      .populate("dealer", "name address")
      .populate({
        path: "items.variant",
        select: "trim msrp"
      })
      .populate({
        path: "items.color",
        select: "name code"
      });

    res.status(200).json({
      message: "Update order successfully",
      data: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete order
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Kiểm tra quyền xóa (chỉ Admin và Dealer Manager của dealer đó)
    const userRole = req.user.role;
    if (
      userRole !== "Admin" &&
      (userRole !== "Dealer Manager" || req.user.dealer.toString() !== order.dealer.toString())
    ) {
      return res.status(403).json({ message: "Bạn không có quyền xóa order này." });
    }

    await Order.findByIdAndDelete(id);

    res.status(200).json({
      message: "Delete order successfully",
      data: order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
