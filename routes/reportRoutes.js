const express = require('express');
const router = express.Router();
const { protect, allowRoles } = require('../middleware/authMiddleware');
const reportController = require('../controllers/reportController');

// Report endpoints - accessible by EVM Staff, Admin, and Dealer Managers (filtered by their dealer)
router.get('/sales', protect, allowRoles('EVM Staff', 'Admin', 'Dealer Manager'), reportController.salesReport);
router.get('/debt', protect, allowRoles('EVM Staff', 'Admin', 'Dealer Manager'), reportController.debtReport);
router.get('/inventory', protect, allowRoles('EVM Staff', 'Admin', 'Dealer Manager'), reportController.inventoryReport);

module.exports = router;

