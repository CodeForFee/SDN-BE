const express = require('express');
const vehicleColorController = require('../controllers/vehicleColorController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Read: DealerStaff/Manager cần xem colors để tạo quote/order, EVMStaff & Admin quản lý
router.get('/', protect, allowRoles('DealerStaff', 'DealerManager', 'EVMStaff', 'Admin'), vehicleColorController.list);
router.get('/:id', protect, allowRoles('DealerStaff', 'DealerManager', 'EVMStaff', 'Admin'), vehicleColorController.get);
// Create/Update/Delete: Chỉ EVMStaff & Admin
router.post('/', protect, allowRoles('EVMStaff', 'Admin'), vehicleColorController.create);
router.patch('/:id', protect, allowRoles('EVMStaff', 'Admin'), vehicleColorController.update);
router.delete('/:id', protect, allowRoles('Admin'), vehicleColorController.remove);

module.exports = router;

