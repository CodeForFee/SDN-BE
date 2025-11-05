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
    if (userRole === "DealerStaff" || userRole === "DealerManager") {
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
      .populate("dealer", "name region address")
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
    // EVMStaff và Admin có thể xem tất cả orders
    // DealerStaff/Manager chỉ xem orders của dealer mình
    if (
      (userRole === "DealerStaff" || userRole === "DealerManager") &&
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
      sales: req.user._id, // Track who created the order
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
    const { status, paymentMethod, expectedDelivery } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Kiểm tra quyền cập nhật (chỉ Dealer Manager và Admin)
    const userRole = req.user.role;
    if (
      userRole !== "Admin" &&
      (userRole !== "DealerManager" || req.user.dealer.toString() !== order.dealer.toString())
    ) {
      return res.status(403).json({ message: "Bạn không có quyền cập nhật order này." });
    }

    const updateFields = {};
    if (status !== undefined) updateFields.status = status;
    if (paymentMethod !== undefined) updateFields.paymentMethod = paymentMethod;
    if (expectedDelivery !== undefined) updateFields.expectedDelivery = new Date(expectedDelivery);

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
      (userRole !== "DealerManager" || req.user.dealer.toString() !== order.dealer.toString())
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

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) return res.status(400).json({ message: "'status' is required" });

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const userRole = req.user.role;

    // DealerStaff chỉ có thể update: allocated→invoiced, invoiced→delivered
    // Không thể update thành 'allocated' (chỉ EVM Staff mới allocate)
    if (userRole === 'DealerStaff') {
      if (status === 'allocated') {
        return res.status(403).json({ 
          message: 'DealerStaff cannot set order status to "allocated". Only EVM Staff can allocate orders.' 
        });
      }
      
      // Validate status transitions for DealerStaff
      const validTransitions = {
        'allocated': ['invoiced', 'cancelled'],
        'invoiced': ['delivered']
      };
      
      if (validTransitions[order.status] && !validTransitions[order.status].includes(status)) {
        return res.status(400).json({ 
          message: `Cannot update status from "${order.status}" to "${status}". Valid transitions: ${validTransitions[order.status].join(', ')}` 
        });
      }
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status, $push: { logs: { at: new Date(), by: req.user.email || req.user._id.toString(), action: 'status', note: status } } },
      { new: true }
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

    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Helper function: Auto-create installment plan when order is confirmed with paymentMethod: finance
const createInstallmentPlanForOrder = async (order) => {
  if (order.paymentMethod !== 'finance') {
    return null;
  }

  const InstallmentPlan = require('../models/InstallmentPlan');
  
  // Check if plan already exists
  const existingPlan = await InstallmentPlan.findOne({ order: order._id });
  if (existingPlan) {
    return existingPlan;
  }

  // Calculate total amount from order items minus deposit
  const totalAmount = order.items.reduce((sum, item) => {
    return sum + (item.unitPrice * item.qty);
  }, 0) - (order.deposit || 0);

  // Default: 12 months, monthly
  const installmentCount = 12;
  const installmentPeriod = 'monthly';
  const installmentAmount = totalAmount / installmentCount;
  const roundedAmount = Math.round(installmentAmount / 1000) * 1000; // Round to 1000

  // Generate payment schedule
  const payments = [];
  const start = new Date();
  start.setMonth(start.getMonth() + 1); // Start next month

  for (let i = 1; i <= installmentCount; i++) {
    const dueDate = new Date(start);
    dueDate.setMonth(dueDate.getMonth() + (i - 1));

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
    order: order._id,
    customer: order.customer,
    dealer: order.dealer,
    totalAmount,
    remainingAmount: totalAmount,
    installmentCount,
    installmentPeriod,
    startDate: start,
    payments,
  });

  return plan;
};

// Helper function: Auto-create dealer contract when order is allocated
const createDealerContractForOrder = async (order, createdBy) => {
  const DealerContract = require('../models/DealerContract');
  
  // Check if contract already exists
  const existingContract = await DealerContract.findOne({ order: order._id });
  if (existingContract) {
    return existingContract;
  }

  // Calculate wholesale price (90% of retail price)
  const totalAmount = order.items.reduce((sum, item) => {
    const wholesalePrice = item.unitPrice * 0.9; // 10% discount for dealer
    return sum + (wholesalePrice * item.qty);
  }, 0);

  // Generate contract number
  const contractCount = await DealerContract.countDocuments();
  const contractNo = `DC-${new Date().getFullYear()}-${String(contractCount + 1).padStart(4, '0')}`;

  const contract = await DealerContract.create({
    contractNo,
    dealer: order.dealer,
    order: order._id,
    contractType: 'distribution',
    totalAmount,
    debtAmount: totalAmount,
    signedDate: new Date(),
    effectiveDate: new Date(),
    status: 'active',
    createdBy: createdBy || undefined,
  });

  return contract;
};

// @desc Approve order (Dealer Manager)
exports.approveOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body || {};

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check permission - only Dealer Manager of the same dealer or Admin
    const userRole = req.user.role;
    if (
      userRole !== "Admin" &&
      (userRole !== "DealerManager" || req.user.dealer.toString() !== order.dealer.toString())
    ) {
      return res.status(403).json({ message: "You don't have permission to approve this order" });
    }

    // Check if order is in valid state for approval
    if (order.status !== "new") {
      return res.status(400).json({ 
        message: `Order cannot be approved. Current status: ${order.status}` 
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { 
        status: "confirmed",
        $push: { 
          logs: { 
            at: new Date(), 
            by: req.user.email || req.user._id.toString(), 
            action: 'approved', 
            note: note || 'Order approved by manager' 
          } 
        } 
      },
      { new: true }
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

    // Auto-create installment plan if paymentMethod is finance
    let installmentPlan = null;
    if (updatedOrder.paymentMethod === 'finance') {
      try {
        installmentPlan = await createInstallmentPlanForOrder(updatedOrder);
      } catch (error) {
        console.error('Error creating installment plan:', error);
        // Continue even if installment plan creation fails
      }
    }

    res.status(200).json({
      message: "Order approved successfully",
      data: updatedOrder,
      installmentPlan: installmentPlan ? {
        _id: installmentPlan._id,
        totalAmount: installmentPlan.totalAmount,
        installmentCount: installmentPlan.installmentCount,
      } : null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Reject order (Dealer Manager)
exports.rejectOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body || {};

    if (!reason) {
      return res.status(400).json({ message: "Rejection reason is required" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check permission - only Dealer Manager of the same dealer or Admin
    const userRole = req.user.role;
    if (
      userRole !== "Admin" &&
      (userRole !== "DealerManager" || req.user.dealer.toString() !== order.dealer.toString())
    ) {
      return res.status(403).json({ message: "You don't have permission to reject this order" });
    }

    // Check if order is in valid state for rejection
    if (order.status === "cancelled" || order.status === "delivered") {
      return res.status(400).json({ 
        message: `Order cannot be rejected. Current status: ${order.status}` 
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { 
        status: "cancelled",
        $push: { 
          logs: { 
            at: new Date(), 
            by: req.user.email || req.user._id.toString(), 
            action: 'rejected', 
            note: reason 
          } 
        } 
      },
      { new: true }
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
      message: "Order rejected successfully",
      data: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Attach payment info (reference)
exports.attachPaymentToOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentId } = req.body;
    if (!paymentId) return res.status(400).json({ message: "'paymentId' is required" });
    const order = await Order.findByIdAndUpdate(
      id,
      { $push: { logs: { at: new Date(), by: req.user.email || req.user._id.toString(), action: 'payment', note: paymentId } } },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.status(200).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Attach delivery info
exports.attachDeliveryToOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { actualDelivery, deliveryNote } = req.body;
    const update = {};
    if (actualDelivery) update.actualDelivery = new Date(actualDelivery);
    const order = await Order.findByIdAndUpdate(
      id,
      {
        ...update,
        $push: { logs: { at: new Date(), by: req.user.email || req.user._id.toString(), action: 'delivery', note: deliveryNote || '' } },
      },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.status(200).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc Allocate order (EVM Staff) - Kiểm tra kho và allocate vehicles
exports.allocateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes, expectedDelivery } = req.body;

    const Inventory = require('../models/Inventory');

    const order = await Order.findById(id)
      .populate('dealer', 'name');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check permission - only EVM Staff or Admin
    const userRole = req.user.role;
    if (userRole !== 'EVMStaff' && userRole !== 'Admin') {
      return res.status(403).json({ 
        message: 'Only EVM Staff can allocate orders' 
      });
    }

    // Check if order is in valid state for allocation
    if (order.status !== 'confirmed') {
      return res.status(400).json({ 
        message: `Order cannot be allocated. Current status: ${order.status}. Order must be 'confirmed' first.` 
      });
    }

    // Check inventory availability for each item
    const allocationResults = [];
    const VehicleVariant = require('../models/VehicleVariant');
    const VehicleColor = require('../models/VehicleColor');
    
    for (const item of order.items) {
      // Populate variant and color info for better error messages
      const variant = await VehicleVariant.findById(item.variant).populate('model', 'name brand');
      const color = item.color ? await VehicleColor.findById(item.color) : null;
      
      // Query inventory - EVM inventory should have ownerType = 'EVM' and owner = null/undefined
      // Try multiple query patterns to find inventory
      let inventory = null;
      
      // First try: exact match with color (if exists) and owner = null
      if (item.color) {
        inventory = await Inventory.findOne({
          ownerType: 'EVM',
          variant: item.variant,
          color: item.color,
          $or: [{ owner: null }, { owner: { $exists: false } }]
        });
      }
      
      // If not found and item has color, try without owner condition (owner might be set incorrectly)
      if (!inventory && item.color) {
        inventory = await Inventory.findOne({
          ownerType: 'EVM',
          variant: item.variant,
          color: item.color
        });
      }
      
      // If item has no color, try to find inventory with no color
      if (!inventory && !item.color) {
        inventory = await Inventory.findOne({
          ownerType: 'EVM',
          variant: item.variant,
          $and: [
            { $or: [{ color: null }, { color: { $exists: false } }] },
            { $or: [{ owner: null }, { owner: { $exists: false } }] }
          ]
        });
        
        // Fallback: try without owner condition
        if (!inventory) {
          inventory = await Inventory.findOne({
            ownerType: 'EVM',
            variant: item.variant,
            $or: [{ color: null }, { color: { $exists: false } }]
          });
        }
      }

      if (!inventory) {
        const variantName = variant ? `${variant.trim}${variant.model ? ` (${variant.model.brand} ${variant.model.name})` : ''}` : item.variant;
        const colorName = color ? color.name : '';
        const itemInfo = colorName ? `${variantName} - Color: ${colorName}` : variantName;
        
        // Debug: Check what inventories exist for this variant
        const existingInventories = await Inventory.find({
          ownerType: 'EVM',
          variant: item.variant
        }).select('variant color owner ownerType quantity reserved');
        
        return res.status(400).json({
          message: `Inventory not found for ${itemInfo}. Please create EVM inventory first in the Inventory Management page.`,
          variant: item.variant,
          color: item.color || null,
          variantName: variantName,
          colorName: colorName,
          debug: {
            queryUsed: {
              ownerType: 'EVM',
              variant: item.variant.toString(),
              color: item.color ? item.color.toString() : null
            },
            existingInventories: existingInventories.map(inv => ({
              id: inv._id.toString(),
              variant: inv.variant?.toString() || 'null',
              color: inv.color?.toString() || 'null',
              owner: inv.owner?.toString() || 'null',
              ownerType: inv.ownerType,
              quantity: inv.quantity,
              reserved: inv.reserved
            }))
          }
        });
      }

      const available = (inventory.quantity || 0) - (inventory.reserved || 0);
      
      if (available < item.qty) {
        const variant = await VehicleVariant.findById(item.variant).populate('model', 'name brand');
        const color = item.color ? await VehicleColor.findById(item.color) : null;
        const variantName = variant ? `${variant.trim}${variant.model ? ` (${variant.model.brand} ${variant.model.name})` : ''}` : item.variant;
        const colorName = color ? color.name : '';
        const itemInfo = colorName ? `${variantName} - Color: ${colorName}` : variantName;
        
        return res.status(400).json({
          message: `Insufficient inventory for ${itemInfo}. Available: ${available}, Requested: ${item.qty}. Please check inventory or update quantity.`,
          variant: item.variant,
          color: item.color || null,
          variantName: variantName,
          colorName: colorName,
          available: available,
          requested: item.qty
        });
      }

      allocationResults.push({
        variant: item.variant,
        color: item.color,
        quantity: item.qty,
        inventoryId: inventory._id
      });
    }

    // Allocate inventory - Reserve vehicles and transfer to dealer
    for (const allocation of allocationResults) {
      // Reserve vehicles in EVM inventory (tăng reserved)
      await Inventory.findByIdAndUpdate(
        allocation.inventoryId,
        {
          $inc: { reserved: allocation.quantity }
        }
      );

      // Trừ quantity từ EVM inventory (vì đã transfer sang dealer)
      await Inventory.findByIdAndUpdate(
        allocation.inventoryId,
        {
          $inc: { quantity: -allocation.quantity }
        }
      );

      // Transfer from EVM to Dealer inventory
      // Find or create dealer inventory
      let dealerInventory = await Inventory.findOne({
        ownerType: 'Dealer',
        owner: order.dealer,
        variant: allocation.variant,
        color: allocation.color || null,
      });

      if (dealerInventory) {
        dealerInventory.quantity = (dealerInventory.quantity || 0) + allocation.quantity;
        await dealerInventory.save();
      } else {
        // Create dealer inventory if doesn't exist
        dealerInventory = await Inventory.create({
          ownerType: 'Dealer',
          owner: order.dealer,
          variant: allocation.variant,
          color: allocation.color || null,
          quantity: allocation.quantity,
        });
      }
    }

    // Update order status to allocated
    const updateData = {
      status: 'allocated',
      $push: {
        logs: {
          at: new Date(),
          by: req.user.email || req.user._id.toString(),
          action: 'allocated',
          note: notes || 'Order allocated by EVM Staff - inventory reserved and transferred to dealer'
        }
      }
    };

    if (expectedDelivery) {
      updateData.expectedDelivery = new Date(expectedDelivery);
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
      .populate("customer", "fullName email phone")
      .populate("dealer", "name address")
      .populate({
        path: "items.variant",
        select: "trim msrp",
        populate: {
          path: "model",
          select: "name brand"
        }
      })
      .populate({
        path: "items.color",
        select: "name code"
      });

    // Auto-create dealer contract when order is allocated
    let dealerContract = null;
    try {
      dealerContract = await createDealerContractForOrder(updatedOrder, req.user._id);
    } catch (error) {
      console.error('Error creating dealer contract:', error);
      // Continue even if contract creation fails
    }

    res.status(200).json({
      message: 'Order allocated successfully. Inventory reserved and transferred to dealer.',
      data: updatedOrder,
      allocationSummary: allocationResults,
      dealerContract: dealerContract ? {
        _id: dealerContract._id,
        contractNo: dealerContract.contractNo,
        totalAmount: dealerContract.totalAmount,
        debtAmount: dealerContract.debtAmount,
      } : null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Reject order by EVM Staff
exports.rejectOrderByEVM = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check permission - only EVM Staff or Admin
    const userRole = req.user.role;
    if (userRole !== 'EVMStaff' && userRole !== 'Admin') {
      return res.status(403).json({ 
        message: 'Only EVM Staff can reject orders from this endpoint' 
      });
    }

    // Check if order is in valid state for rejection
    if (order.status !== 'confirmed') {
      return res.status(400).json({ 
        message: `Order cannot be rejected. Current status: ${order.status}. Only 'confirmed' orders can be rejected by EVM Staff.` 
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      {
        status: 'cancelled',
        $push: {
          logs: {
            at: new Date(),
            by: req.user.email || req.user._id.toString(),
            action: 'rejected_by_evm',
            note: reason
          }
        }
      },
      { new: true }
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
      message: 'Order rejected by EVM Staff',
      data: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
