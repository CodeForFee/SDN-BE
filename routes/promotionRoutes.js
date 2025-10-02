const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotionController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roles');

// Dealer & Hãng đều có thể xem khuyến mãi
// router.get('/', protect, allowRoles('Dealer Staff', 'Dealer Manager', 'EVM Staff', 'Admin'), promotionController.getPromotions);

// Quản lý khuyến mãi chỉ EVM Staff & Admin
// router.post('/', protect, allowRoles('EVM Staff', 'Admin'), promotionController.createPromotion);
// router.put('/:id', protect, allowRoles('EVM Staff', 'Admin'), promotionController.updatePromotion);
// router.delete('/:id', protect, allowRoles('EVM Staff', 'Admin'), promotionController.deletePromotion);

module.exports = router;
