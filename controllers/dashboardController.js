const Order = require('../models/Order');
const Dealer = require('../models/Dealer');

exports.summary = async (req, res) => {
  try {
    const userRole = req.user.role;
    
    // Filter theo dealer nếu là DealerStaff hoặc DealerManager
    let orderFilter = {};
    if ((userRole === 'DealerStaff' || userRole === 'DealerManager') && req.user.dealer) {
      orderFilter.dealer = req.user.dealer;
    }

    const [totalOrders, deliveredCount, allOrders] = await Promise.all([
      Order.countDocuments(orderFilter),
      Order.countDocuments({ ...orderFilter, status: 'delivered' }),
      Order.find(orderFilter).select('status customer').lean(),
    ]);

    // Count orders by status
    const ordersByStatus = {};
    allOrders.forEach(order => {
      const status = order.status || 'unknown';
      ordersByStatus[status] = (ordersByStatus[status] || 0) + 1;
    });

    // Count unique customers
    const uniqueCustomers = new Set();
    allOrders.forEach(order => {
      if (order.customer) {
        uniqueCustomers.add(order.customer.toString());
      }
    });

    // Top dealers (chỉ Admin/EVMStaff)
    let topDealers = [];
    if (userRole === 'Admin' || userRole === 'EVMStaff') {
      topDealers = await Order.aggregate([
        { $group: { _id: '$dealer', orders: { $sum: 1 } } },
        { $sort: { orders: -1 } },
        { $limit: 5 },
      ]);
    }

    res.status(200).json({
      totalOrders,
      delivered: deliveredCount,
      totalCustomers: uniqueCustomers.size,
      ordersByStatus,
      topDealers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.trends = async (req, res) => {
  try {
    const last30 = new Date();
    last30.setDate(last30.getDate() - 30);
    
    // Lọc theo dealer nếu là DealerStaff hoặc DealerManager
    const matchFilter = { createdAt: { $gte: last30 } };
    if ((req.user.role === 'DealerStaff' || req.user.role === 'DealerManager') && req.user.dealer) {
      matchFilter.dealer = req.user.dealer;
    }
    
    const byDay = await Order.aggregate([
      { $match: matchFilter },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    res.status(200).json(byDay);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


