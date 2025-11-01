const express = require('express');
const vehicleColorController = require('../controllers/vehicleColorController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Chỉ EVM Staff & Admin được quản lý vehicle colors (không có Dealer Staff/Manager)
router.get('/', protect, allowRoles('EVMStaff', 'Admin'), vehicleColorController.list);
router.get('/:id', protect, allowRoles('EVMStaff', 'Admin'), vehicleColorController.get);
router.post('/', protect, allowRoles('EVMStaff', 'Admin'), vehicleColorController.create);
router.patch('/:id', protect, allowRoles('EVMStaff', 'Admin'), vehicleColorController.update);
router.delete('/:id', protect, allowRoles('Admin'), vehicleColorController.remove);

module.exports = router;

