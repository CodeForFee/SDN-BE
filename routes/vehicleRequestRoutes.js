const express = require('express');
const router = express.Router();
const vehicleRequestController = require('../controllers/vehicleRequestController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/authMiddleware');

// Get all vehicle requests
router.get('/', protect, allowRoles('DealerManager', 'DealerStaff', 'EVMStaff', 'Admin'), vehicleRequestController.getVehicleRequests);

// Get vehicle request by ID
router.get('/:id', protect, allowRoles('DealerManager', 'DealerStaff', 'EVMStaff', 'Admin'), vehicleRequestController.getVehicleRequestById);

// Create vehicle request (Dealer Manager/Staff)
router.post('/', protect, allowRoles('DealerManager', 'DealerStaff'), vehicleRequestController.createVehicleRequest);

// Approve vehicle request (EVM Staff)
router.put('/:id/approve', protect, allowRoles('EVMStaff', 'Admin'), vehicleRequestController.approveVehicleRequest);

// Reject vehicle request (EVM Staff)
router.put('/:id/reject', protect, allowRoles('EVMStaff', 'Admin'), vehicleRequestController.rejectVehicleRequest);

// Cancel vehicle request (Dealer Manager/Staff)
router.put('/:id/cancel', protect, allowRoles('DealerManager', 'DealerStaff'), vehicleRequestController.cancelVehicleRequest);

module.exports = router;

