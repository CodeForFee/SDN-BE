const Order = require('../models/Order');
const Dealer = require('../models/Dealer');

exports.summary = async (req, res) => {
  try {
    const [totalOrders, deliveredCount] = await Promise.all([
      Order.countDocuments({}),
      Order.countDocuments({ status: 'delivered' }),
    ]);

    const topDealers = await Order.aggregate([
      { $group: { _id: '$dealer', orders: { $sum: 1 } } },
      { $sort: { orders: -1 } },
      { $limit: 5 },
    ]);

    res.status(200).json({
      totalOrders,
      delivered: deliveredCount,
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
    const byDay = await Order.aggregate([
      { $match: { createdAt: { $gte: last30 } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    res.status(200).json(byDay);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


