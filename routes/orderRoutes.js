const express = require('express');
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Dealer Staff, Dealer Manager quản lý đơn hàng của đại lý
router.get('/', protect, allowRoles('DealerStaff', 'DealerManager', 'Admin'), orderController.getOrders);
router.get('/:id', protect, allowRoles('DealerStaff', 'DealerManager', 'Admin'), orderController.getOrderById);
router.post('/', protect, allowRoles('DealerStaff', 'DealerManager', 'Admin'), orderController.createOrder);
router.patch('/:id', protect, allowRoles('DealerStaff', 'DealerManager', 'Admin'), orderController.updateOrder);
router.delete('/:id', protect, allowRoles('Admin', 'DealerManager'), orderController.deleteOrder);

// Subroutes per spec
router.put('/:id/status', protect, allowRoles('DealerManager', 'EVMStaff'), orderController.updateOrderStatus);
router.put('/:id/payment', protect, allowRoles('DealerStaff', 'DealerManager'), orderController.attachPaymentToOrder);
router.put('/:id/delivery', protect, allowRoles('DealerStaff', 'DealerManager'), orderController.attachDeliveryToOrder);

module.exports = router;

