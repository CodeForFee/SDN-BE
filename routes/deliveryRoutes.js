const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/authMiddleware');

// Get all deliveries (đặt trước /:orderId để tránh xung đột)
router.get('/', protect, allowRoles('DealerStaff', 'DealerManager', 'Admin',  'EVMStaff'), deliveryController.getAllDeliveries);
router.post('/', protect, allowRoles('DealerStaff'), deliveryController.createDelivery);
// DealerStaff và DealerManager có thể cập nhật trạng thái giao xe
router.put('/:id/status', protect, allowRoles('DealerStaff', 'DealerManager', 'EVMStaff'), deliveryController.updateDeliveryStatus);
router.get('/:orderId', protect, allowRoles('DealerStaff', 'DealerManager', 'EVMStaff'), deliveryController.getDeliveryByOrder);

module.exports = router;


