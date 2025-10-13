const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roles');

// Dealer Staff/Manager có thể xem xe
router.get('/', protect, allowRoles('Dealer Staff', 'Dealer Manager', 'EVM Staff', 'Admin'), vehicleController.getVehicles);
router.get('/:id', protect, allowRoles('Dealer Staff', 'Dealer Manager', 'EVM Staff', 'Admin'), vehicleController.getVehicleById);

// Chỉ EVM Staff & Admin được thêm/sửa/xóa
router.post('/', protect, allowRoles('EVM Staff', 'Admin'), vehicleController.createVehicle);
router.put('/:id', protect, allowRoles('EVM Staff', 'Admin'), vehicleController.updateVehicle);
router.delete('/:id', protect, allowRoles('EVM Staff', 'Admin'), vehicleController.deleteVehicle);

module.exports = router;
