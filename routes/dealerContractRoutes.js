const express = require('express');
const router = express.Router();
const dealerContractController = require('../controllers/dealerContractController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/authMiddleware');

// Tất cả routes đều cần authentication
router.use(protect);

// GET /api/dealer-contracts - Get all dealer contracts
router.get(
  '/',
  allowRoles('DealerManager', 'EVMStaff', 'Admin'),
  dealerContractController.getDealerContracts
);

// GET /api/dealer-contracts/order/:orderId - Get dealer contract by order ID
// PHẢI ĐẶT TRƯỚC route /:id để tránh conflict
router.get(
  '/order/:orderId',
  allowRoles('DealerManager', 'EVMStaff', 'Admin'),
  dealerContractController.getDealerContractByOrder
);

// GET /api/dealer-contracts/:id - Get dealer contract by ID
router.get(
  '/:id',
  allowRoles('DealerManager', 'EVMStaff', 'Admin'),
  dealerContractController.getDealerContractById
);

// POST /api/dealer-contracts - Create dealer contract
router.post(
  '/',
  allowRoles('EVMStaff', 'Admin'),
  dealerContractController.createDealerContract
);

// PUT /api/dealer-contracts/:id - Update dealer contract
router.put(
  '/:id',
  allowRoles('EVMStaff', 'Admin'),
  dealerContractController.updateDealerContract
);

// PUT /api/dealer-contracts/:id/payment - Record payment from dealer to EVM
router.put(
  '/:id/payment',
  allowRoles('EVMStaff', 'Admin'),
  dealerContractController.recordPayment
);

module.exports = router;

