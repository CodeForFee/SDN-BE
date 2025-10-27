const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roles');

// Chỉ EVM Staff & Admin được xem và quản lý xe (không có Dealer Staff/Manager)
router.get('/', protect, allowRoles('EVMStaff', 'Admin'), vehicleController.getVehicles);
router.get('/:id', protect, allowRoles('EVMStaff', 'Admin'), vehicleController.getVehicleById);

// Chỉ EVM Staff & Admin được thêm/sửa/xóa
router.post('/', protect, allowRoles('EVMStaff', 'Admin'), vehicleController.createVehicle);
router.put('/:id', protect, allowRoles('EVMStaff', 'Admin'), vehicleController.updateVehicle);
router.delete('/:id', protect, allowRoles('EVMStaff', 'Admin'), vehicleController.deleteVehicle);

module.exports = router;
