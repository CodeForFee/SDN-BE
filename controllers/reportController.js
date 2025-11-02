const Order = require("../models/Order");
const Inventory = require("../models/Inventory");
const Dealer = require("../models/Dealer");
const VehicleVariant = require("../models/VehicleVariant");

// @desc Sales report
exports.salesReport = async (req, res) => {
  try {
    const { startDate, endDate, dealerId, staffId } = req.query;
    const userRole = req.user.role;

    let filter = {};
    
    // Nếu là Dealer Manager, chỉ xem báo cáo của dealer mình
    if (userRole === "DealerManager") {
      if (req.user.dealer) {
        filter.dealer = req.user.dealer;
      } else {
        return res.status(400).json({ 
          message: "Tài khoản đại lý chưa được liên kết với đại lý nào." 
        });
      }
    } else if (dealerId && (userRole === "EVMStaff" || userRole === "Admin")) {
      filter.dealer = dealerId;
    }

    // Filter theo staff (nhân viên bán hàng)
    if (staffId) {
      // Dealer Manager chỉ có thể xem staff của dealer mình
      if (userRole === "DealerManager") {
        const User = require('../models/User');
        const staff = await User.findById(staffId);
        if (!staff || staff.dealer?.toString() !== req.user.dealer.toString()) {
          return res.status(403).json({ 
            message: "Không có quyền xem báo cáo của nhân viên này" 
          });
        }
      }
      filter.sales = staffId;
    }

    // Filter theo thời gian
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(filter)
      .populate("customer", "fullName")
      .populate("dealer", "name address")
      .populate("sales", "email profile.name")
      .populate({
        path: "items.variant",
        select: "trim msrp"
      });

    // Calculate revenue from order items
    const calculateOrderRevenue = (order) => {
      return order.items.reduce((sum, item) => sum + (item.unitPrice * item.qty), 0);
    };

    // Tính toán thống kê
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + calculateOrderRevenue(order), 0);
    
    // Map order status values
    const statusMap = {
      'new': 'new',
      'confirmed': 'confirmed',
      'allocated': 'allocated',
      'invoiced': 'invoiced',
      'delivered': 'delivered',
      'cancelled': 'cancelled'
    };
    
    const pendingOrders = orders.filter(order => order.status === "new").length;
    const confirmedOrders = orders.filter(order => order.status === "confirmed").length;
    const deliveredOrders = orders.filter(order => order.status === "delivered").length;

    // Thống kê theo dealer
    const dealerStats = {};
    orders.forEach(order => {
      if (!order.dealer) return;
      const dealerId = order.dealer._id ? order.dealer._id.toString() : (typeof order.dealer === 'string' ? order.dealer : null);
      const dealerName = order.dealer?.name || 'Unknown';
      
      // Use dealerId as key, fallback to name if no ID
      const key = dealerId || dealerName;
      
      if (!dealerStats[key]) {
        dealerStats[key] = {
          _id: dealerId,
          name: dealerName,
          totalOrders: 0,
          totalRevenue: 0,
          newOrders: 0,
          confirmedOrders: 0,
          deliveredOrders: 0
        };
      }
      dealerStats[key].totalOrders++;
      dealerStats[key].totalRevenue += calculateOrderRevenue(order);
      if (order.status === 'new') dealerStats[key].newOrders++;
      if (order.status === 'confirmed') dealerStats[key].confirmedOrders++;
      if (order.status === 'delivered') dealerStats[key].deliveredOrders++;
    });
    
    // Populate salesTarget for each dealer
    const dealerIds = Object.values(dealerStats).map(s => s._id).filter(Boolean);
    if (dealerIds.length > 0) {
      const dealersWithTargets = await Dealer.find({ _id: { $in: dealerIds } }).select('_id salesTarget');
      dealersWithTargets.forEach(dealer => {
        Object.values(dealerStats).forEach(stat => {
          if (stat._id && stat._id.toString() === dealer._id.toString()) {
            stat.salesTarget = dealer.salesTarget || 0;
          }
        });
      });
    }

    // Thống kê theo nhân viên (staff) - chỉ khi không filter theo staffId
    const staffStats = {};
    if (!staffId) {
      orders.forEach(order => {
        if (!order.sales) return;
        const staffId = order.sales._id.toString();
        const staffName = order.sales.profile?.name || order.sales.email || 'Unknown';
        
        if (!staffStats[staffId]) {
          staffStats[staffId] = {
            staffId,
            staffName,
            totalOrders: 0,
            totalRevenue: 0,
            newOrders: 0,
            confirmedOrders: 0,
            deliveredOrders: 0
          };
        }
        staffStats[staffId].totalOrders++;
        staffStats[staffId].totalRevenue += calculateOrderRevenue(order);
        if (order.status === 'new') staffStats[staffId].newOrders++;
        if (order.status === 'confirmed') staffStats[staffId].confirmedOrders++;
        if (order.status === 'delivered') staffStats[staffId].deliveredOrders++;
      });
    }

    res.status(200).json({
      success: true,
      period: {
        startDate: startDate || null,
        endDate: endDate || null
      },
      filters: {
        dealerId: dealerId || null,
        staffId: staffId || null
      },
      summary: {
        totalOrders,
        totalRevenue,
        newOrders: pendingOrders,
        confirmedOrders,
        deliveredOrders
      },
      dealerStats: Object.values(dealerStats),
      staffStats: Object.values(staffStats),
      orders: orders.slice(0, 100) // Limit to latest 100 orders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Debt report
exports.debtReport = async (req, res) => {
  try {
    const userRole = req.user.role;
    const Order = require('../models/Order');
    const Payment = require('../models/Payment');

    let filter = {};
    
    // Nếu là Dealer Manager, chỉ xem báo cáo của dealer mình
    if (userRole === "DealerManager") {
      if (req.user.dealer) {
        filter._id = req.user.dealer;
      } else {
        return res.status(400).json({ 
          message: "Tài khoản đại lý chưa được liên kết với đại lý nào." 
        });
      }
    }

    const dealers = await Dealer.find(filter);

    // Tính công nợ động cho từng dealer
    // Công nợ = Tổng giá trị orders đã allocated - Tổng payments đã confirmed
    const dealersWithDebt = [];
    const allDealersData = []; // Hiển thị tất cả dealers để debug
    let totalDebt = 0;

    for (const dealer of dealers) {
      // Lấy tất cả orders đã allocated (xe đã giao đến đại lý)
      const allocatedOrders = await Order.find({
        dealer: dealer._id,
        status: { $in: ['allocated', 'invoiced', 'delivered'] }
      }).populate('items.variant', 'trim msrp');

      // Tính tổng giá trị orders đã allocated
      let totalOrderValue = 0;
      for (const order of allocatedOrders) {
        // Tính tổng giá trị order = sum(items.unitPrice * items.qty)
        const orderTotal = (order.items || []).reduce((sum, item) => {
          const unitPrice = item.unitPrice || 0;
          const qty = item.qty || 0;
          return sum + (unitPrice * qty);
        }, 0);
        totalOrderValue += orderTotal;
      }

      // Lấy tất cả payments đã confirmed cho các orders này
      const orderIds = allocatedOrders.map(o => o._id);
      const confirmedPayments = orderIds.length > 0 ? await Payment.find({
        order: { $in: orderIds },
        status: 'confirmed'
      }) : [];

      // Tính tổng payments đã confirmed
      const totalPaid = confirmedPayments.reduce((sum, payment) => {
        return sum + (payment.amount || 0);
      }, 0);

      // Công nợ = Tổng giá trị orders - Tổng payments đã trả
      const debt = totalOrderValue - totalPaid;

      // Lưu thông tin cho debug (hiển thị tất cả dealers)
      const dealerData = {
        id: dealer._id,
        name: dealer.name,
        address: dealer.address || '',
        debt: debt,
        salesTarget: dealer.salesTarget || 0,
        // Debug info
        _debug: {
          totalOrders: allocatedOrders.length,
          totalOrderValue: totalOrderValue,
          totalPayments: confirmedPayments.length,
          totalPaid: totalPaid,
          orderIds: orderIds.map(id => id.toString())
        }
      };

      allDealersData.push(dealerData);

      // Chỉ thêm vào dealersWithDebt nếu có debt > 0
      if (debt > 0) {
        dealersWithDebt.push({
          id: dealer._id,
          name: dealer.name,
          address: dealer.address || '',
          debt: debt,
          salesTarget: dealer.salesTarget || 0
        });
        totalDebt += debt;
      }
    }

    // Sắp xếp theo nợ giảm dần
    dealersWithDebt.sort((a, b) => b.debt - a.debt);
    allDealersData.sort((a, b) => b.debt - a.debt);

    res.status(200).json({
      success: true,
      summary: {
        totalDealers: dealers.length,
        totalDebt,
        dealersWithDebt: dealersWithDebt.length,
        averageDebt: dealers.length > 0 ? totalDebt / dealers.length : 0
      },
      // Hiển thị tất cả dealers để debug (kể cả debt = 0)
      dealers: allDealersData.map(d => ({
        id: d.id,
        name: d.name,
        address: d.address,
        debt: d.debt,
        salesTarget: d.salesTarget,
        // Include debug info
        _debug: d._debug
      })),
      // Chỉ dealers có debt > 0 (để backward compatibility)
      dealersWithDebt: dealersWithDebt
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
    if (userRole === "DealerManager") {
      if (req.user.dealer) {
        filter.owner = req.user.dealer;
        filter.ownerType = "Dealer";
      } else {
        return res.status(400).json({ 
          message: "Tài khoản đại lý chưa được liên kết với đại lý nào." 
        });
      }
    }

    const inventory = await Inventory.find(filter)
      .populate("variant", "trim msrp")
      .populate("color", "name code")
      .populate("owner", "name address");

    // Tính toán thống kê
    const totalItems = inventory.length;
    const totalQuantity = inventory.reduce((sum, item) => sum + item.quantity, 0);
    const lowStockItems = inventory.filter(item => item.quantity < 5); // Dưới 5 xe
    const outOfStockItems = inventory.filter(item => item.quantity === 0);

    // Thống kê theo dealer
    const dealerStats = {};
    inventory.forEach(item => {
      if (item.ownerType === 'Dealer' && item.owner) {
        const dealerName = item.owner.name;
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
      }
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
        variant: item.variant ? item.variant.trim : 'N/A',
        color: item.color ? item.color.name : 'N/A',
        owner: item.owner ? item.owner.name : 'N/A',
        ownerType: item.ownerType,
        quantity: item.quantity
      })),
      outOfStockItems: outOfStockItems.map(item => ({
        id: item._id,
        variant: item.variant ? item.variant.trim : 'N/A',
        color: item.color ? item.color.name : 'N/A',
        owner: item.owner ? item.owner.name : 'N/A',
        ownerType: item.ownerType,
        quantity: item.quantity
      })),
      allInventory: inventory
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Personal sales report for Dealer Staff
exports.personalReport = async (req, res) => {
  try {
    const { startDate, endDate, period } = req.query; // period: 'month' or 'quarter'
    const userRole = req.user.role;
    const userId = req.user._id;

    // Only Dealer Staff can view personal reports
    if (userRole !== "DealerStaff") {
      return res.status(403).json({ 
        message: "Only Dealer Staff can view personal sales reports" 
      });
    }

    // Build date filter
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (period === 'month') {
      // Current month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      dateFilter.createdAt = { $gte: startOfMonth, $lte: endOfMonth };
    } else if (period === 'quarter') {
      // Current quarter
      const now = new Date();
      const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
      const startOfQuarter = new Date(now.getFullYear(), quarterStartMonth, 1);
      const endOfQuarter = new Date(now.getFullYear(), quarterStartMonth + 3, 0, 23, 59, 59);
      dateFilter.createdAt = { $gte: startOfQuarter, $lte: endOfQuarter };
    }

    // Filter orders by sales person (created by this Dealer Staff)
    const filter = {
      sales: userId,
      ...dateFilter
    };

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
      })
      .sort({ createdAt: -1 });

    // Calculate statistics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => {
      return sum + order.items.reduce((itemSum, item) => {
        return itemSum + (item.unitPrice * item.qty);
      }, 0);
    }, 0);
    
    const ordersByStatus = {
      new: orders.filter(o => o.status === 'new').length,
      confirmed: orders.filter(o => o.status === 'confirmed').length,
      allocated: orders.filter(o => o.status === 'allocated').length,
      invoiced: orders.filter(o => o.status === 'invoiced').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
    };

    // Group by month for trends
    const monthlyData = {};
    orders.forEach(order => {
      const monthKey = new Date(order.createdAt).toISOString().substring(0, 7); // YYYY-MM
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { count: 0, revenue: 0 };
      }
      monthlyData[monthKey].count++;
      monthlyData[monthKey].revenue += order.items.reduce((sum, item) => 
        sum + (item.unitPrice * item.qty), 0);
    });

    res.status(200).json({
      success: true,
      period: {
        startDate: startDate || null,
        endDate: endDate || null,
        period: period || null
      },
      summary: {
        totalOrders,
        totalRevenue,
        ordersByStatus,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
      },
      monthlyTrends: monthlyData,
      orders: orders.slice(0, 50) // Limit to latest 50 orders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
