const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/authMiddleware');

// Read: All roles can view vehicles
router.get('/', protect, allowRoles('DealerStaff', 'DealerManager', 'EVMStaff', 'Admin'), vehicleController.getVehicles);

// Compare multiple vehicles - supports both GET (query params) and POST (JSON body)
// NOTE: Must be defined BEFORE /:id route to avoid route conflicts
router.get('/compare', protect, allowRoles('DealerStaff', 'DealerManager', 'EVMStaff', 'Admin'), vehicleController.compareVehicles);
router.post('/compare', protect, allowRoles('DealerStaff', 'DealerManager', 'EVMStaff', 'Admin'), vehicleController.compareVehicles);

router.get('/:id', protect, allowRoles('DealerStaff', 'DealerManager', 'EVMStaff', 'Admin'), vehicleController.getVehicleById);

// Create/Update/Delete: EVM Staff & Admin
router.post('/', protect, allowRoles('EVMStaff', 'Admin'), vehicleController.createVehicle);
router.put('/:id', protect, allowRoles('EVMStaff', 'Admin'), vehicleController.updateVehicle);
router.delete('/:id', protect, allowRoles('EVMStaff', 'Admin'), vehicleController.deleteVehicle);

module.exports = router;
