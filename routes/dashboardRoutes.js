const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/authMiddleware');

router.get('/summary', protect, allowRoles('Admin', 'EVMStaff'), dashboardController.summary);
router.get('/trends', protect, allowRoles('DealerManager', 'EVMStaff'), dashboardController.trends);

module.exports = router;


