const express = require('express');
const router = express.Router();
const dealerController = require('../controllers/dealerController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roles');

// Admin & EVM Staff quản lý đại lý
router.get('/', protect, allowRoles('EVM Staff', 'Admin'), dealerController.getDealers);
router.post('/', protect, allowRoles('Admin'), dealerController.createDealer);
// router.put('/:id', protect, allowRoles('Admin'), dealerController.updateDealer);
// router.delete('/:id', protect, allowRoles('Admin'), dealerController.deleteDealer);

module.exports = router;
