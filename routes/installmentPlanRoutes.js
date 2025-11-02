const express = require('express');
const router = express.Router();
const installmentPlanController = require('../controllers/installmentPlanController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/authMiddleware');

// Tất cả routes đều cần authentication
router.use(protect);

// GET /api/installment-plans - Get all installment plans
router.get(
  '/',
  allowRoles('DealerStaff', 'DealerManager', 'EVMStaff', 'Admin'),
  installmentPlanController.getInstallmentPlans
);

// GET /api/installment-plans/order/:orderId - Get installment plan by order ID
// PHẢI ĐẶT TRƯỚC route /:id để tránh conflict
router.get(
  '/order/:orderId',
  allowRoles('DealerStaff', 'DealerManager', 'EVMStaff', 'Admin'),
  installmentPlanController.getInstallmentPlanByOrder
);

// GET /api/installment-plans/:id - Get installment plan by ID
router.get(
  '/:id',
  allowRoles('DealerStaff', 'DealerManager', 'EVMStaff', 'Admin'),
  installmentPlanController.getInstallmentPlanById
);

// POST /api/installment-plans - Create installment plan (thường tự động tạo)
router.post(
  '/',
  allowRoles('DealerStaff', 'DealerManager', 'EVMStaff', 'Admin'),
  installmentPlanController.createInstallmentPlan
);

// PUT /api/installment-plans/:id/payment - Update installment payment status
router.put(
  '/:id/payment',
  allowRoles('DealerStaff', 'DealerManager', 'Admin'),
  installmentPlanController.updateInstallmentPayment
);

// PUT /api/installment-plans/mark-overdue - Mark overdue payments (Admin/EVMStaff)
router.put(
  '/mark-overdue',
  allowRoles('EVMStaff', 'Admin'),
  installmentPlanController.markOverduePayments
);

module.exports = router;

