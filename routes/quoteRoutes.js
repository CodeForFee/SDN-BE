const express = require('express');
const router = express.Router();
const quoteController = require('../controllers/quoteController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roles');

// Dealer Staff/Manager tạo và quản lý báo giá
// router.get('/', protect, allowRoles('Dealer Staff', 'Dealer Manager', 'Admin'), quoteController.getQuotes);
// router.post('/', protect, allowRoles('Dealer Staff', 'Dealer Manager'), quoteController.createQuote);
// router.get('/:id', protect, allowRoles('Dealer Staff', 'Dealer Manager', 'Admin'), quoteController.getQuoteById);
// router.put('/:id', protect, allowRoles('Dealer Manager', 'Admin'), quoteController.updateQuote);
// router.delete('/:id', protect, allowRoles('Dealer Manager', 'Admin'), quoteController.deleteQuote);

module.exports = router;
