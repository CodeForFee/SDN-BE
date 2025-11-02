const DealerContract = require('../models/DealerContract');
const Order = require('../models/Order');
const Payment = require('../models/Payment');

// @desc Get all dealer contracts
exports.getDealerContracts = async (req, res) => {
  try {
    const userRole = req.user.role;
    let filter = {};

    // Dealer Manager chỉ xem contracts của dealer mình
    if (userRole === 'DealerManager') {
      if (req.user.dealer) {
        filter.dealer = req.user.dealer;
      } else {
        return res.status(400).json({ 
          message: 'Tài khoản đại lý chưa được liên kết với đại lý nào.' 
        });
      }
    }

    // Filter theo dealer nếu có
    if (req.query.dealerId) {
      filter.dealer = req.query.dealerId;
    }

    // Filter theo order nếu có
    if (req.query.orderId) {
      filter.order = req.query.orderId;
    }

    // Filter theo status nếu có
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const contracts = await DealerContract.find(filter)
      .populate('dealer', 'name address region')
      .populate('order', 'orderNo status')
      .populate('createdBy', 'email profile.name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: contracts.length,
      data: contracts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get dealer contract by ID
exports.getDealerContractById = async (req, res) => {
  try {
    const { id } = req.params;
    const contract = await DealerContract.findById(id)
      .populate('dealer', 'name address region contactInfo')
      .populate('order', 'orderNo status items')
      .populate('createdBy', 'email profile.name');

    if (!contract) {
      return res.status(404).json({ message: 'Dealer contract not found' });
    }

    // Check permission
    const userRole = req.user.role;
    if (userRole === 'DealerManager' && req.user.dealer) {
      if (contract.dealer.toString() !== req.user.dealer.toString()) {
        return res.status(403).json({ message: 'Không có quyền xem contract này' });
      }
    }

    res.status(200).json(contract);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get dealer contract by order ID
exports.getDealerContractByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const contract = await DealerContract.findOne({ order: orderId })
      .populate('dealer', 'name address region')
      .populate('order', 'orderNo status items')
      .populate('createdBy', 'email profile.name');

    if (!contract) {
      return res.status(404).json({ message: 'Dealer contract not found for this order' });
    }

    // Check permission
    const userRole = req.user.role;
    if (userRole === 'DealerManager' && req.user.dealer) {
      if (contract.dealer.toString() !== req.user.dealer.toString()) {
        return res.status(403).json({ message: 'Không có quyền xem contract này' });
      }
    }

    res.status(200).json(contract);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Create dealer contract (thường được tự động tạo khi EVM Staff allocate order)
exports.createDealerContract = async (req, res) => {
  try {
    const { 
      orderId, 
      dealerId, 
      contractType, 
      effectiveDate, 
      expiryDate, 
      terms, 
      discountRate, 
      creditLimit, 
      paymentTerm,
      files,
      notes 
    } = req.body;

    // EVM Staff or Admin only
    const userRole = req.user.role;
    if (userRole !== 'EVMStaff' && userRole !== 'Admin') {
      return res.status(403).json({ message: 'Only EVM Staff and Admin can create dealer contracts' });
    }

    let order, dealer;

    if (orderId) {
      // Get order and dealer from order
      order = await Order.findById(orderId)
        .populate('dealer', 'name address');
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      dealer = order.dealer;
    } else if (dealerId) {
      // Create contract directly for dealer (without specific order)
      dealer = await require('../models/Dealer').findById(dealerId);
      if (!dealer) {
        return res.status(404).json({ message: 'Dealer not found' });
      }
    } else {
      return res.status(400).json({ message: 'Either orderId or dealerId is required' });
    }

    // Check if contract already exists for this order
    if (orderId) {
      const existingContract = await DealerContract.findOne({ order: orderId });
      if (existingContract) {
        return res.status(400).json({ message: 'Dealer contract already exists for this order' });
      }
    }

    // Calculate total amount from order items (if order exists)
    let totalAmount = 0;
    if (order) {
      // Tính giá sỉ (wholesale price) - có thể là giá msrp hoặc giá đã có chiết khấu
      totalAmount = order.items.reduce((sum, item) => {
        // Sử dụng unitPrice (giá bán lẻ) hoặc có thể lấy giá sỉ từ variant
        // Giả sử giá sỉ = 90% giá bán lẻ (có thể cấu hình)
        const wholesalePrice = item.unitPrice * 0.9;
        return sum + (wholesalePrice * item.qty);
      }, 0);
    } else {
      // Nếu không có order, cần totalAmount từ req.body
      if (!req.body.totalAmount) {
        return res.status(400).json({ message: 'totalAmount is required when orderId is not provided' });
      }
      totalAmount = req.body.totalAmount;
    }

    // Generate contract number
    const contractCount = await DealerContract.countDocuments();
    const contractNo = `DC-${new Date().getFullYear()}-${String(contractCount + 1).padStart(4, '0')}`;

    const contract = await DealerContract.create({
      contractNo,
      dealer: dealer._id,
      order: orderId || undefined,
      contractType: contractType || 'distribution',
      totalAmount,
      debtAmount: totalAmount, // Ban đầu debt = totalAmount
      signedDate: effectiveDate ? new Date(effectiveDate) : new Date(),
      effectiveDate: effectiveDate ? new Date(effectiveDate) : new Date(),
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      status: 'active',
      terms,
      discountPolicy: {
        discountRate: discountRate || 0,
        creditLimit: creditLimit || 0,
        paymentTerm: paymentTerm || 30,
      },
      files: files || [],
      createdBy: req.user._id,
      notes,
    });

    const populatedContract = await DealerContract.findById(contract._id)
      .populate('dealer', 'name address region')
      .populate('order', 'orderNo status')
      .populate('createdBy', 'email profile.name');

    res.status(201).json({
      message: 'Dealer contract created successfully',
      data: populatedContract,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update dealer contract
exports.updateDealerContract = async (req, res) => {
  try {
    const { id } = req.params;
    const contract = await DealerContract.findById(id);

    if (!contract) {
      return res.status(404).json({ message: 'Dealer contract not found' });
    }

    // EVM Staff or Admin only
    const userRole = req.user.role;
    if (userRole !== 'EVMStaff' && userRole !== 'Admin') {
      return res.status(403).json({ message: 'Only EVM Staff and Admin can update dealer contracts' });
    }

    const { 
      effectiveDate, 
      expiryDate, 
      terms, 
      discountRate, 
      creditLimit, 
      paymentTerm,
      files,
      status,
      notes 
    } = req.body;

    if (effectiveDate) contract.effectiveDate = new Date(effectiveDate);
    if (expiryDate) contract.expiryDate = new Date(expiryDate);
    if (terms !== undefined) contract.terms = terms;
    if (discountRate !== undefined) contract.discountPolicy.discountRate = discountRate;
    if (creditLimit !== undefined) contract.discountPolicy.creditLimit = creditLimit;
    if (paymentTerm !== undefined) contract.discountPolicy.paymentTerm = paymentTerm;
    if (files !== undefined) contract.files = files;
    if (status) contract.status = status;
    if (notes !== undefined) contract.notes = notes;

    await contract.save();

    const updatedContract = await DealerContract.findById(id)
      .populate('dealer', 'name address region')
      .populate('order', 'orderNo status')
      .populate('createdBy', 'email profile.name');

    res.status(200).json({
      message: 'Dealer contract updated successfully',
      data: updatedContract,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Record payment from dealer to EVM (update paidAmount and debtAmount)
exports.recordPayment = async (req, res) => {
  try {
    const { id } = req.params; // Contract ID
    const { amount, paymentId, notes } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }

    const contract = await DealerContract.findById(id);
    if (!contract) {
      return res.status(404).json({ message: 'Dealer contract not found' });
    }

    // EVM Staff or Admin only
    const userRole = req.user.role;
    if (userRole !== 'EVMStaff' && userRole !== 'Admin') {
      return res.status(403).json({ message: 'Only EVM Staff and Admin can record payments' });
    }

    // Update paidAmount
    contract.paidAmount = (contract.paidAmount || 0) + amount;
    // debtAmount will be auto-calculated in pre-save hook

    if (paymentId) {
      // Link payment to contract
      await Payment.findByIdAndUpdate(paymentId, {
        dealerContract: contract._id,
        payerType: 'dealer',
      });
    }

    if (notes) {
      contract.notes = (contract.notes || '') + '\n' + new Date().toISOString() + ': ' + notes;
    }

    await contract.save();

    const updatedContract = await DealerContract.findById(id)
      .populate('dealer', 'name address region')
      .populate('order', 'orderNo status')
      .populate('createdBy', 'email profile.name');

    res.status(200).json({
      message: 'Payment recorded successfully',
      data: updatedContract,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

