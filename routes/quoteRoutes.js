const express = require('express');
const quoteController = require('../controllers/quoteController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Dealer Staff, Dealer Manager quản lý báo giá
router.get('/', protect, allowRoles('DealerStaff', 'DealerManager', 'Admin'), quoteController.getQuotes);
router.get('/:id', protect, allowRoles('DealerStaff', 'DealerManager', 'Admin'), quoteController.getQuoteById);
router.post('/', protect, allowRoles('DealerStaff', 'DealerManager', 'Admin'), quoteController.createQuote);
router.patch('/:id', protect, allowRoles('DealerStaff', 'DealerManager', 'Admin'), quoteController.updateQuote);
router.delete('/:id', protect, allowRoles('Admin'), quoteController.deleteQuote);

// Convert quote to order
router.put('/:id/convert', protect, allowRoles('DealerStaff', 'DealerManager'), quoteController.convertQuote);

module.exports = router;

