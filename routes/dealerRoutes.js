const express = require('express');
const dealerController = require('../controllers/dealerController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Dealer Manager, EVM Staff & Admin có thể xem đại lý
router.get('/', protect, allowRoles('DealerManager', 'EVMStaff', 'Admin'), dealerController.getDealers);
router.get('/:id', protect, allowRoles('DealerManager', 'EVMStaff', 'Admin'), dealerController.getDealerById);

// Chỉ Admin tạo mới đại lý
router.post('/', protect, allowRoles('Admin'), dealerController.createDealer);

// Dealer Manager có thể cập nhật thông tin đại lý của mình, Admin có thể cập nhật tất cả
router.patch('/:id', protect, allowRoles('DealerManager', 'Admin'), dealerController.updateDealer);

// Chỉ Admin xóa đại lý
router.delete('/:id', protect, allowRoles('Admin'), dealerController.deleteDealer);

// Dealer inventory view
router.get('/:id/inventory', protect, allowRoles('DealerManager', 'EVMStaff'), dealerController.getDealerInventory);

// Update sales target
router.put('/:id/target', protect, allowRoles('Admin', 'EVMStaff'), dealerController.updateDealerTarget);

module.exports = router;

