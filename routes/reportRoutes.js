const express = require('express');
const router = express.Router();
const { protect, allowRoles } = require('../middleware/authMiddleware');
const reportController = require('../controllers/reportController');

// Dealer Manager: Xem báo cáo liên quan đến hoạt động đại lý
// EVM Staff: Xem báo cáo về hiệu suất của các dòng xe
// Admin: Xem tất cả báo cáo
router.get('/sales', protect, allowRoles('DealerManager', 'EVMStaff', 'Admin'), reportController.salesReport);
router.get('/debt', protect, allowRoles('DealerManager', 'EVMStaff', 'Admin'), reportController.debtReport);
router.get('/inventory', protect, allowRoles('DealerManager', 'EVMStaff', 'Admin'), reportController.inventoryReport);

module.exports = router;

