const Payment = require('../models/Payment');

// @desc Get all payments (with pagination)
exports.getAllPayments = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userRole = req.user.role;
    
    let filter = {};
    
    // Dealer Staff/Manager chỉ xem payments của dealer mình
    if (userRole === "DealerStaff" || userRole === "DealerManager") {
      if (req.user.dealer) {
        // Cần populate order để lọc theo dealer
        const payments = await Payment.find()
          .populate({
            path: 'order',
            match: { dealer: req.user.dealer },
            select: 'orderNo dealer customer'
          })
          .populate('order.customer', 'fullName phone')
          .sort({ createdAt: -1 });
          
        // Filter out payments where order is null (không thuộc dealer này)
        const filteredPayments = payments.filter(payment => payment.order !== null);
        
        // Manual pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedPayments = filteredPayments.slice(startIndex, endIndex);
        
        return res.status(200).json({
          success: true,
          data: paginatedPayments,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: filteredPayments.length,
            pages: Math.ceil(filteredPayments.length / limit)
          }
        });
      } else {
        return res.status(400).json({ 
          message: "Tài khoản đại lý chưa được liên kết với đại lý nào." 
        });
      }
    }
    
    // Admin có thể xem tất cả
    const skip = (page - 1) * limit;
    const payments = await Payment.find(filter)
      .populate({
        path: 'order',
        select: 'orderNo dealer customer',
        populate: {
          path: 'customer',
          select: 'fullName phone'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
      
    const total = await Payment.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      data: payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createPayment = async (req, res) => {
  try {
    const created = await Payment.create(req.body);
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getPaymentsByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const items = await Payment.find({ order: orderId })
      .populate({
        path: 'order',
        select: 'orderNo dealer customer',
        populate: {
          path: 'customer',
          select: 'fullName phone'
        }
      });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findById(id)
      .populate({
        path: 'order',
        select: 'orderNo dealer customer',
        populate: {
          path: 'customer',
          select: 'fullName phone'
        }
      });
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Prepare update data
    const updateData = { status };
    
    // If status is 'confirmed', automatically set paidAt to current date
    if (status === 'confirmed') {
      updateData.paidAt = new Date();
    }
    
    const updated = await Payment.findByIdAndUpdate(id, updateData, { new: true })
      .populate({
        path: 'order',
        select: 'orderNo dealer customer',
        populate: {
          path: 'customer',
          select: 'fullName phone'
        }
      });
    if (!updated) return res.status(404).json({ message: 'Payment not found' });
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Payment.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })
      .populate({
        path: 'order',
        select: 'orderNo dealer customer',
        populate: {
          path: 'customer',
          select: 'fullName phone'
        }
      });
    if (!updated) return res.status(404).json({ message: 'Payment not found' });
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Payment.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Payment not found' });
    res.status(200).json({ 
      success: true, 
      message: 'Payment deleted successfully',
      data: deleted 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


