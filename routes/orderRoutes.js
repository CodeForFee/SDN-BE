const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roles');

// Dealer Staff/Manager tạo và quản lý đơn hàng
// router.get('/', protect, allowRoles('Dealer Staff', 'Dealer Manager', 'Admin'), orderController.getOrders);
// router.post('/', protect, allowRoles('Dealer Staff', 'Dealer Manager'), orderController.createOrder);
// router.put('/:id', protect, allowRoles('Dealer Manager', 'Admin'), orderController.updateOrder);
// router.delete('/:id', protect, allowRoles('Dealer Manager', 'Admin'), orderController.deleteOrder);

module.exports = router;
