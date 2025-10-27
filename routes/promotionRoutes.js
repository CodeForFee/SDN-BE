const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotionController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roles');

// Dealer Staff, Dealer Manager có thể xem khuyến mãi (chỉ đọc)
// EVM Staff & Admin có thể quản lý
router.get('/', protect, allowRoles('DealerStaff', 'DealerManager', 'EVMStaff', 'Admin'), promotionController.getPromotions);

// Chỉ EVM Staff & Admin có thể tạo/sửa khuyến mãi
router.post('/', protect, allowRoles('EVMStaff', 'Admin'), promotionController.createPromotion);
router.put('/:id', protect, allowRoles('EVMStaff', 'Admin'), promotionController.updatePromotion);
router.delete('/:id', protect, allowRoles('EVMStaff', 'Admin'), promotionController.deletePromotion);

module.exports = router;
