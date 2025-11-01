const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/authMiddleware');

router.post('/', protect, allowRoles('DealerStaff'), deliveryController.createDelivery);
router.put('/:id/status', protect, allowRoles('DealerManager'), deliveryController.updateDeliveryStatus);
router.get('/:orderId', protect, allowRoles('DealerStaff', 'DealerManager'), deliveryController.getDeliveryByOrder);

module.exports = router;


