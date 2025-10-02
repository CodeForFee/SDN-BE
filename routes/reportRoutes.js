const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roles');

// Báo cáo dành cho Dealer Manager, EVM Staff, Admin
// router.get('/sales', protect, allowRoles('Dealer Manager', 'EVM Staff', 'Admin'), reportController.salesReport);
// router.get('/debts', protect, allowRoles('Dealer Manager', 'EVM Staff', 'Admin'), reportController.debtReport);
// router.get('/inventory', protect, allowRoles('EVM Staff', 'Admin'), reportController.inventoryReport);

module.exports = router;
