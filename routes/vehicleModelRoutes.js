const express = require('express');
const vehicleModelController = require('../controllers/vehicleModelController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Read: DealerStaff/Manager cần xem models để tạo quote/order, EVMStaff & Admin quản lý
router.get('/', protect, allowRoles('DealerStaff', 'DealerManager', 'EVMStaff', 'Admin'), vehicleModelController.list);
router.get('/:id', protect, allowRoles('DealerStaff', 'DealerManager', 'EVMStaff', 'Admin'), vehicleModelController.get);
// Create/Update/Delete: Chỉ EVMStaff & Admin
router.post('/', protect, allowRoles('EVMStaff', 'Admin'), vehicleModelController.create);
router.patch('/:id', protect, allowRoles('EVMStaff', 'Admin'), vehicleModelController.update);
router.delete('/:id', protect, allowRoles('Admin'), vehicleModelController.remove);

module.exports = router;

