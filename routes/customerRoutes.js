const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roles');

// Dealer Staff/Manager quản lý khách hàng
// router.get('/', protect, allowRoles('Dealer Staff', 'Dealer Manager', 'Admin'), customerController.getCustomers);
// router.post('/', protect, allowRoles('Dealer Staff', 'Dealer Manager', 'Admin'), customerController.createCustomer);
// router.put('/:id', protect, allowRoles('Dealer Staff', 'Dealer Manager', 'Admin'), customerController.updateCustomer);
// router.delete('/:id', protect, allowRoles('Dealer Manager', 'Admin'), customerController.deleteCustomer);

module.exports = router;
