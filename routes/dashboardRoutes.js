const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/authMiddleware');

// Summary: Admin và EVMStaff xem tổng quan hệ thống
router.get('/summary', protect, allowRoles('Admin', 'EVMStaff', 'DealerManager', 'DealerStaff'), dashboardController.summary);
// Trends: DealerManager, DealerStaff và EVMStaff có thể xem trends (DealerStaff chỉ xem của dealer mình)
router.get('/trends', protect, allowRoles('DealerManager', 'EVMStaff', 'Admin', 'DealerStaff'), dashboardController.trends);

module.exports = router;


