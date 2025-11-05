const express = require('express');
const testDriveController = require('../controllers/testDriveController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Dealer Staff, Dealer Manager quản lý lịch lái thử
router.get('/', protect, allowRoles('DealerStaff', 'DealerManager', 'Admin'), testDriveController.getTestDrives);
router.get('/:id', protect, allowRoles('DealerStaff', 'DealerManager', 'Admin'), testDriveController.getTestDriveById);
router.post('/', protect, allowRoles('DealerStaff', 'DealerManager', 'Admin'), testDriveController.createTestDrive);
router.patch('/:id', protect, allowRoles('DealerStaff', 'DealerManager', 'Admin'), testDriveController.updateTestDrive);
router.delete('/:id', protect, allowRoles('Admin'), testDriveController.deleteTestDrive);

module.exports = router;

