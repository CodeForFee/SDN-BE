const Order = require("../model/Order");
const Inventory = require("../model/Inventory");
const Dealer = require("../model/Dealer");
const Vehicle = require("../model/Vehicle");

// @desc Sales report
exports.salesReport = async (req, res) => {
  try {
    const { startDate, endDate, dealerId } = req.query;
    const userRole = req.user.role;

    let filter = {};
    
    // Nếu là Dealer Manager, chỉ xem báo cáo của dealer mình
    if (userRole === "Dealer Manager") {
      if (req.user.dealer) {
        filter.dealer = req.user.dealer;
      } else {
        return res.status(400).json({ 
          message: "Tài khoản đại lý chưa được liên kết với đại lý nào." 
        });
      }
    } else if (dealerId && (userRole === "EVM Staff" || userRole === "Admin")) {
      filter.dealer = dealerId;
    }

    // Filter theo thời gian
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(filter)
      .populate("customer", "name")
      .populate("dealer", "name location")
      .populate("vehicle", "model version price");

    // Tính toán thống kê
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.amount || 0), 0);
    const pendingOrders = orders.filter(order => order.status === "Pending").length;
    const confirmedOrders = orders.filter(order => order.status === "Confirmed").length;
    const deliveredOrders = orders.filter(order => order.status === "Delivered").length;

    // Thống kê theo dealer
    const dealerStats = {};
    orders.forEach(order => {
      const dealerName = order.dealer.name;
      if (!dealerStats[dealerName]) {
        dealerStats[dealerName] = {
          totalOrders: 0,
          totalRevenue: 0,
          pendingOrders: 0,
          confirmedOrders: 0,
          deliveredOrders: 0
        };
      }
      dealerStats[dealerName].totalOrders++;
      dealerStats[dealerName].totalRevenue += order.amount || 0;
      dealerStats[dealerName][`${order.status.toLowerCase()}Orders`]++;
    });

    res.status(200).json({
      success: true,
      period: {
        startDate: startDate || null,
        endDate: endDate || null
      },
      summary: {
        totalOrders,
        totalRevenue,
        pendingOrders,
        confirmedOrders,
        deliveredOrders
      },
      dealerStats,
      orders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Debt report
exports.debtReport = async (req, res) => {
  try {
    const userRole = req.user.role;

    let filter = {};
    
    // Nếu là Dealer Manager, chỉ xem báo cáo của dealer mình
    if (userRole === "Dealer Manager") {
      if (req.user.dealer) {
        filter._id = req.user.dealer;
      } else {
        return res.status(400).json({ 
          message: "Tài khoản đại lý chưa được liên kết với đại lý nào." 
        });
      }
    }

    const dealers = await Dealer.find(filter);

    // Tính toán tổng nợ và thống kê
    const totalDebt = dealers.reduce((sum, dealer) => sum + (dealer.debt || 0), 0);
    const dealersWithDebt = dealers.filter(dealer => dealer.debt > 0);

    // Sắp xếp theo nợ giảm dần
    dealersWithDebt.sort((a, b) => (b.debt || 0) - (a.debt || 0));

    res.status(200).json({
      success: true,
      summary: {
        totalDealers: dealers.length,
        totalDebt,
        dealersWithDebt: dealersWithDebt.length,
        averageDebt: dealers.length > 0 ? totalDebt / dealers.length : 0
      },
      dealers: dealersWithDebt.map(dealer => ({
        id: dealer._id,
        name: dealer.name,
        location: dealer.location,
        debt: dealer.debt || 0,
        salesTarget: dealer.salesTarget || 0
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Inventory report
exports.inventoryReport = async (req, res) => {
  try {
    const userRole = req.user.role;

    let filter = {};
    
    // Nếu là Dealer Manager, chỉ xem tồn kho của dealer mình
    if (userRole === "Dealer Manager") {
      if (req.user.dealer) {
        filter.dealer = req.user.dealer;
      } else {
        return res.status(400).json({ 
          message: "Tài khoản đại lý chưa được liên kết với đại lý nào." 
        });
      }
    }

    const inventory = await Inventory.find(filter)
      .populate("vehicle", "model version price")
      .populate("dealer", "name location");

    // Tính toán thống kê
    const totalItems = inventory.length;
    const totalQuantity = inventory.reduce((sum, item) => sum + item.quantity, 0);
    const lowStockItems = inventory.filter(item => item.quantity < 5); // Dưới 5 xe
    const outOfStockItems = inventory.filter(item => item.quantity === 0);

    // Thống kê theo dealer
    const dealerStats = {};
    inventory.forEach(item => {
      const dealerName = item.dealer.name;
      if (!dealerStats[dealerName]) {
        dealerStats[dealerName] = {
          totalItems: 0,
          totalQuantity: 0,
          lowStockItems: 0,
          outOfStockItems: 0
        };
      }
      dealerStats[dealerName].totalItems++;
      dealerStats[dealerName].totalQuantity += item.quantity;
      if (item.quantity < 5) dealerStats[dealerName].lowStockItems++;
      if (item.quantity === 0) dealerStats[dealerName].outOfStockItems++;
    });

    res.status(200).json({
      success: true,
      summary: {
        totalItems,
        totalQuantity,
        lowStockItems: lowStockItems.length,
        outOfStockItems: outOfStockItems.length
      },
      dealerStats,
      lowStockItems: lowStockItems.map(item => ({
        id: item._id,
        vehicle: item.vehicle.model,
        dealer: item.dealer.name,
        quantity: item.quantity
      })),
      outOfStockItems: outOfStockItems.map(item => ({
        id: item._id,
        vehicle: item.vehicle.model,
        dealer: item.dealer.name,
        quantity: item.quantity
      })),
      allInventory: inventory
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
