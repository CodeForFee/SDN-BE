const express = require('express');
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/authMiddleware');

const router = express.Router();
// Get all payments
router.get('/', protect, allowRoles('Admin', 'DealerStaff', 'DealerManager'), paymentController.getAllPayments);
// Create payment
router.post('/', protect, allowRoles('DealerStaff', 'DealerManager'), paymentController.createPayment);
// Get payments by order
router.get('/:orderId', protect, allowRoles('DealerStaff', 'DealerManager'), paymentController.getPaymentsByOrder);
// Update status
router.put('/:id/status', protect, allowRoles('DealerManager'), paymentController.updatePaymentStatus);

module.exports = router;

