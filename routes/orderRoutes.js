const express = require('express');
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Dealer Staff, Dealer Manager quản lý đơn hàng của đại lý
// EVM Staff cần xem orders để allocate
router.get('/', protect, allowRoles('DealerStaff', 'DealerManager', 'EVMStaff', 'Admin'), orderController.getOrders);
router.get('/:id', protect, allowRoles('DealerStaff', 'DealerManager', 'EVMStaff', 'Admin'), orderController.getOrderById);
router.post('/', protect, allowRoles('DealerStaff', 'DealerManager', 'Admin'), orderController.createOrder);
router.patch('/:id', protect, allowRoles('DealerStaff', 'DealerManager', 'Admin'), orderController.updateOrder);
router.delete('/:id', protect, allowRoles('Admin', 'DealerManager'), orderController.deleteOrder);

// Subroutes per spec
// DealerStaff cần update status (allocated→invoiced, invoiced→delivered)
router.put('/:id/status', protect, allowRoles('DealerStaff', 'DealerManager', 'EVMStaff', 'Admin'), orderController.updateOrderStatus);
router.put('/:id/approve', protect, allowRoles('DealerManager', 'Admin'), orderController.approveOrder);
router.put('/:id/reject', protect, allowRoles('DealerManager', 'Admin'), orderController.rejectOrder);
router.put('/:id/payment', protect, allowRoles('DealerStaff', 'DealerManager'), orderController.attachPaymentToOrder);
router.put('/:id/delivery', protect, allowRoles('DealerStaff', 'DealerManager'), orderController.attachDeliveryToOrder);

// EVM Staff routes - Order allocation
router.put('/:id/allocate', protect, allowRoles('EVMStaff', 'Admin'), orderController.allocateOrder);
router.put('/:id/reject-by-evm', protect, allowRoles('EVMStaff', 'Admin'), orderController.rejectOrderByEVM);

module.exports = router;

