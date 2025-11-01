const express = require('express');
const customerController = require('../controllers/customerController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Dealer Staff, Dealer Manager có thể quản lý khách hàng của đại lý
router.get('/', protect, allowRoles('DealerStaff', 'DealerManager', 'Admin'), customerController.getCustomers);
router.get('/:id', protect, allowRoles('DealerStaff', 'DealerManager', 'Admin'), customerController.getCustomerById);
router.post('/', protect, allowRoles('DealerStaff', 'DealerManager', 'Admin'), customerController.createCustomer);
router.patch('/:id', protect, allowRoles('DealerStaff', 'DealerManager', 'Admin'), customerController.updateCustomer);
router.delete('/:id', protect, allowRoles('Admin'), customerController.deleteCustomer);

module.exports = router;

