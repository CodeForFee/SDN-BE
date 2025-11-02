const express = require('express');
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/authMiddleware');

const router = express.Router();
// Get all payments
router.get('/', protect, allowRoles('Admin', 'DealerStaff', 'DealerManager'), paymentController.getAllPayments);
// Create payment
router.post('/', protect, allowRoles('DealerStaff', 'DealerManager'), paymentController.createPayment);
// Get payments by order (đặt trước /:id để tránh xung đột)
router.get('/order/:orderId', protect, allowRoles('DealerStaff', 'DealerManager', 'Admin'), paymentController.getPaymentsByOrder);
// Get payment by ID
router.get('/:id', protect, allowRoles('DealerStaff', 'DealerManager', 'Admin'), paymentController.getPaymentById);
// Update status
router.put('/:id/status', protect, allowRoles('DealerManager'), paymentController.updatePaymentStatus);
// Update payment (general update)
router.patch('/:id', protect, allowRoles('DealerManager'), paymentController.updatePayment);
// Delete payment
router.delete('/:id', protect, allowRoles('Admin'), paymentController.deletePayment);

module.exports = router;

