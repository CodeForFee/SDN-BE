const express = require('express');
const TestDrive = require('../models/TestDrive');
const createCrudController = require('../controllers/crudController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roles');

const router = express.Router();
const ctrl = createCrudController(TestDrive);

// Dealer Staff, Dealer Manager quản lý lịch lái thử
router.get('/', protect, allowRoles('DealerStaff', 'DealerManager', 'Admin'), ctrl.list);
router.get('/:id', protect, allowRoles('DealerStaff', 'DealerManager', 'Admin'), ctrl.get);
router.post('/', protect, allowRoles('DealerStaff', 'DealerManager', 'Admin'), ctrl.create);
router.patch('/:id', protect, allowRoles('DealerStaff', 'DealerManager', 'Admin'), ctrl.update);
router.delete('/:id', protect, allowRoles('Admin'), ctrl.remove);

module.exports = router;

