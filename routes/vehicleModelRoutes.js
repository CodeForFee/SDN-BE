const express = require('express');
const VehicleModel = require('../models/VehicleModel');
const createCrudController = require('../controllers/crudController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roles');

const router = express.Router();
const ctrl = createCrudController(VehicleModel);

// Chỉ EVM Staff & Admin được quản lý vehicle models (không có Dealer Staff/Manager)
router.get('/', protect, allowRoles('EVMStaff', 'Admin'), ctrl.list);
router.get('/:id', protect, allowRoles('EVMStaff', 'Admin'), ctrl.get);
router.post('/', protect, allowRoles('EVMStaff', 'Admin'), ctrl.create);
router.patch('/:id', protect, allowRoles('EVMStaff', 'Admin'), ctrl.update);
router.delete('/:id', protect, allowRoles('Admin'), ctrl.remove);

module.exports = router;

