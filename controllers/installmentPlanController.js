const InstallmentPlan = require('../models/InstallmentPlan');
const Order = require('../models/Order');
const Payment = require('../models/Payment');

// @desc Get all installment plans
exports.getInstallmentPlans = async (req, res) => {
  try {
    const userRole = req.user.role;
    let filter = {};

    // Dealer Staff/Manager chỉ xem plans của dealer mình
    if (userRole === 'DealerStaff' || userRole === 'DealerManager') {
      if (req.user.dealer) {
        filter.dealer = req.user.dealer;
      } else {
        return res.status(400).json({ 
          message: 'Tài khoản đại lý chưa được liên kết với đại lý nào.' 
        });
      }
    }

    // Filter theo customer nếu có
    if (req.query.customerId) {
      filter.customer = req.query.customerId;
    }

    // Filter theo order nếu có
    if (req.query.orderId) {
      filter.order = req.query.orderId;
    }

    // Filter theo status nếu có
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const plans = await InstallmentPlan.find(filter)
      .populate('order', 'orderNo status paymentMethod')
      .populate('customer', 'fullName phone email')
      .populate('dealer', 'name address')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: plans.length,
      data: plans,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get installment plan by ID
exports.getInstallmentPlanById = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await InstallmentPlan.findById(id)
      .populate('order', 'orderNo status paymentMethod items')
      .populate('customer', 'fullName phone email address')
      .populate('dealer', 'name address')
      .populate('payments.paymentId', 'amount status paidAt');

    if (!plan) {
      return res.status(404).json({ message: 'Installment plan not found' });
    }

    // Check permission
    const userRole = req.user.role;
    if ((userRole === 'DealerStaff' || userRole === 'DealerManager') && req.user.dealer) {
      if (plan.dealer.toString() !== req.user.dealer.toString()) {
        return res.status(403).json({ message: 'Không có quyền xem installment plan này' });
      }
    }

    res.status(200).json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get installment plan by order ID
exports.getInstallmentPlanByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const plan = await InstallmentPlan.findOne({ order: orderId })
      .populate('order', 'orderNo status paymentMethod items')
      .populate('customer', 'fullName phone email address')
      .populate('dealer', 'name address')
      .populate('payments.paymentId', 'amount status paidAt');

    if (!plan) {
      return res.status(404).json({ message: 'Installment plan not found for this order' });
    }

    // Check permission
    const userRole = req.user.role;
    if ((userRole === 'DealerStaff' || userRole === 'DealerManager') && req.user.dealer) {
      if (plan.dealer.toString() !== req.user.dealer.toString()) {
        return res.status(403).json({ message: 'Không có quyền xem installment plan này' });
      }
    }

    res.status(200).json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Create installment plan (thường được tự động tạo khi order được confirm với paymentMethod: finance)
exports.createInstallmentPlan = async (req, res) => {
  try {
    const { orderId, installmentCount, installmentPeriod, startDate, notes } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: 'orderId is required' });
    }

    // Find order
    const order = await Order.findById(orderId)
      .populate('customer', 'fullName')
      .populate('dealer', 'name');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if order has paymentMethod: finance
    if (order.paymentMethod !== 'finance') {
      return res.status(400).json({ 
        message: 'Order must have paymentMethod: finance to create installment plan' 
      });
    }

    // Check if plan already exists
    const existingPlan = await InstallmentPlan.findOne({ order: orderId });
    if (existingPlan) {
      return res.status(400).json({ message: 'Installment plan already exists for this order' });
    }

    // Calculate total amount from order items
    const totalAmount = order.items.reduce((sum, item) => {
      return sum + (item.unitPrice * item.qty);
    }, 0) - (order.deposit || 0); // Trừ deposit nếu có

    // Calculate installment amount
    const installmentAmount = totalAmount / (installmentCount || 12);
    const roundedAmount = Math.round(installmentAmount / 1000) * 1000; // Làm tròn đến 1000

    // Generate payment schedule
    const payments = [];
    const start = new Date(startDate || new Date());
    
    for (let i = 1; i <= installmentCount; i++) {
      const dueDate = new Date(start);
      
      // Add months based on installmentPeriod
      if (installmentPeriod === 'monthly') {
        dueDate.setMonth(dueDate.getMonth() + (i - 1));
      } else if (installmentPeriod === 'quarterly') {
        dueDate.setMonth(dueDate.getMonth() + ((i - 1) * 3));
      } else if (installmentPeriod === 'yearly') {
        dueDate.setFullYear(dueDate.getFullYear() + (i - 1));
      }

      // Last payment gets remaining amount to handle rounding
      const amount = i === installmentCount 
        ? totalAmount - (roundedAmount * (installmentCount - 1))
        : roundedAmount;

      payments.push({
        installmentNumber: i,
        dueDate,
        amount,
        status: 'pending',
      });
    }

    const plan = await InstallmentPlan.create({
      order: orderId,
      customer: order.customer,
      dealer: order.dealer,
      totalAmount,
      remainingAmount: totalAmount,
      installmentCount: installmentCount || 12,
      installmentPeriod: installmentPeriod || 'monthly',
      startDate: startDate || new Date(),
      payments,
      notes,
    });

    const populatedPlan = await InstallmentPlan.findById(plan._id)
      .populate('order', 'orderNo status')
      .populate('customer', 'fullName phone')
      .populate('dealer', 'name');

    res.status(201).json({
      message: 'Installment plan created successfully',
      data: populatedPlan,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update installment payment status (when customer pays an installment)
exports.updateInstallmentPayment = async (req, res) => {
  try {
    const { id } = req.params; // InstallmentPlan ID
    const { installmentPaymentId, paymentId, status, paidAt } = req.body;

    const plan = await InstallmentPlan.findById(id);
    if (!plan) {
      return res.status(404).json({ message: 'Installment plan not found' });
    }

    // Check permission
    const userRole = req.user.role;
    if ((userRole === 'DealerStaff' || userRole === 'DealerManager') && req.user.dealer) {
      if (plan.dealer.toString() !== req.user.dealer.toString()) {
        return res.status(403).json({ message: 'Không có quyền cập nhật installment plan này' });
      }
    }

    // Find the installment payment
    const installmentPayment = plan.payments.id(installmentPaymentId);
    if (!installmentPayment) {
      return res.status(404).json({ message: 'Installment payment not found' });
    }

    // Update installment payment
    if (status) installmentPayment.status = status;
    if (paymentId) installmentPayment.paymentId = paymentId;
    if (paidAt) installmentPayment.paidAt = new Date(paidAt);
    if (req.body.notes !== undefined) installmentPayment.notes = req.body.notes;

    // If status is 'paid', update paidAmount
    if (status === 'paid' && !installmentPayment.paidAt) {
      installmentPayment.paidAt = new Date();
      plan.paidAmount = (plan.paidAmount || 0) + installmentPayment.amount;
    }

    await plan.save();

    const updatedPlan = await InstallmentPlan.findById(id)
      .populate('order', 'orderNo status')
      .populate('customer', 'fullName phone')
      .populate('dealer', 'name')
      .populate('payments.paymentId', 'amount status paidAt');

    res.status(200).json({
      message: 'Installment payment updated successfully',
      data: updatedPlan,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Mark installment payment as overdue (cron job hoặc manual)
exports.markOverduePayments = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find all pending payments where dueDate < today
    const plans = await InstallmentPlan.find({
      status: 'active',
      'payments.status': 'pending',
      'payments.dueDate': { $lt: today },
    });

    let updatedCount = 0;
    for (const plan of plans) {
      for (const payment of plan.payments) {
        if (payment.status === 'pending' && payment.dueDate < today) {
          payment.status = 'overdue';
          updatedCount++;
        }
      }
      await plan.save();
    }

    res.status(200).json({
      message: `Marked ${updatedCount} payments as overdue`,
      updatedCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


