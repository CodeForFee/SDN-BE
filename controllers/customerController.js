const Customer = require("../models/Customer");

exports.getCustomers = async (req, res) => {
  try {
    const userRole = req.user.role;
    
    // DealerStaff và DealerManager chỉ xem khách hàng của dealer mình
    let filter = {};
    if (userRole === "DealerStaff" || userRole === "DealerManager") {
      if (req.user.dealer) {
        filter.ownerDealer = req.user.dealer;
      } else {
        // Nếu user chưa có dealer, trả về empty
        return res.status(200).json({
          success: true,
          count: 0,
          data: [],
        });
      }
    }

    const customers = await Customer.find(filter).populate('ownerDealer', 'name');

    res.status(200).json({
      success: true,
      count: customers.length,
      data: customers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST - Create new customer
exports.createCustomer = async (req, res) => {
  try {
    const { fullName, phone, email, address, notes, segment, idNumber } = req.body;

    if (!fullName) {
      return res.status(400).json({ message: "Full name is required" });
    }

    // Tự động gán ownerDealer và ownerUser từ user hiện tại
    const ownerDealer = req.user?.dealer || null;
    const ownerUser = req.user?._id || null;

    const newCustomer = await Customer.create({
      fullName,
      phone: phone || "",
      email: email || "",
      address: address || "",
      notes: notes || "",
      segment: segment || "retail",
      idNumber: idNumber || "",
      ownerDealer,
      ownerUser,
    });

    res.status(201).json({
      message: "Create new customer successfully",
      data: newCustomer,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH - Update customer
exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, phone, email, address, notes, segment, idNumber } = req.body;

    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Kiểm tra quyền: DealerStaff/Manager chỉ có thể sửa khách hàng của dealer mình
    if (req.user.role === "DealerStaff" || req.user.role === "DealerManager") {
      if (customer.ownerDealer?.toString() !== req.user.dealer?.toString()) {
        return res.status(403).json({ 
          message: "Bạn không có quyền cập nhật khách hàng này" 
        });
      }
    }

    const updateData = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (address !== undefined) updateData.address = address;
    if (notes !== undefined) updateData.notes = notes;
    if (segment !== undefined) updateData.segment = segment;
    if (idNumber !== undefined) updateData.idNumber = idNumber;

    const updatedCustomer = await Customer.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Update customer successfully",
      data: updatedCustomer,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE - Delete customer
exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    await Customer.findByIdAndDelete(id);

    res.status(200).json({
      message: "Delete customer successfully",
      data: customer,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get customer debt (tính dynamic từ orders và payments)
exports.getCustomerDebt = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findById(id);
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Check permission
    const userRole = req.user.role;
    if (userRole === 'DealerStaff' || userRole === 'DealerManager') {
      if (customer.ownerDealer?.toString() !== req.user.dealer?.toString()) {
        return res.status(403).json({ message: 'Không có quyền xem công nợ của khách hàng này' });
      }
    }

    const Order = require('../models/Order');
    const Payment = require('../models/Payment');

    // Lấy tất cả orders của customer (đã confirmed trở lên)
    const orders = await Order.find({
      customer: id,
      status: { $in: ['confirmed', 'allocated', 'invoiced', 'delivered'] }
    });

    // Tính tổng giá trị orders
    let totalOrderValue = 0;
    const orderDetails = [];
    
    for (const order of orders) {
      const orderTotal = order.items.reduce((sum, item) => {
        return sum + (item.unitPrice * item.qty);
      }, 0);
      totalOrderValue += orderTotal;
      
      orderDetails.push({
        orderId: order._id,
        orderNo: order.orderNo,
        totalAmount: orderTotal,
        status: order.status,
        createdAt: order.createdAt,
      });
    }

    // Lấy tất cả payments đã confirmed cho các orders này
    const orderIds = orders.map(o => o._id);
    const confirmedPayments = orderIds.length > 0 
      ? await Payment.find({
          order: { $in: orderIds },
          status: 'confirmed',
          payerType: { $in: ['customer', undefined, null] } // Chỉ payments từ customer
        })
      : [];

    // Tính tổng payments đã trả
    const totalPaid = confirmedPayments.reduce((sum, payment) => {
      return sum + (payment.amount || 0);
    }, 0);

    // Công nợ = Tổng giá trị orders - Tổng payments đã trả
    const debt = totalOrderValue - totalPaid;

    // Chi tiết từng order với công nợ
    const orderDebts = await Promise.all(orderDetails.map(async (orderDetail) => {
      const orderPayments = confirmedPayments.filter(p => 
        p.order.toString() === orderDetail.orderId.toString()
      );
      const orderPaid = orderPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const orderDebt = orderDetail.totalAmount - orderPaid;

      return {
        ...orderDetail,
        paidAmount: orderPaid,
        debt: orderDebt,
        payments: orderPayments.map(p => ({
          _id: p._id,
          amount: p.amount,
          paidAt: p.paidAt,
        })),
      };
    }));

    res.status(200).json({
      customer: {
        _id: customer._id,
        fullName: customer.fullName,
        phone: customer.phone,
        email: customer.email,
      },
      summary: {
        totalOrders: orders.length,
        totalOrderValue,
        totalPaid,
        debt,
      },
      orders: orderDebts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
