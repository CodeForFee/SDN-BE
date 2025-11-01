const express = require('express');
const vehicleModelController = require('../controllers/vehicleModelController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Chỉ EVM Staff & Admin được quản lý vehicle models (không có Dealer Staff/Manager)
router.get('/', protect, allowRoles('EVMStaff', 'Admin'), vehicleModelController.list);
router.get('/:id', protect, allowRoles('EVMStaff', 'Admin'), vehicleModelController.get);
router.post('/', protect, allowRoles('EVMStaff', 'Admin'), vehicleModelController.create);
router.patch('/:id', protect, allowRoles('EVMStaff', 'Admin'), vehicleModelController.update);
router.delete('/:id', protect, allowRoles('Admin'), vehicleModelController.remove);

module.exports = router;

