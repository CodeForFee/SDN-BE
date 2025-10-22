const express = require('express');
const VehicleColor = require('../models/VehicleColor');
const createCrudController = require('../controllers/crudController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roles');

const router = express.Router();
const ctrl = createCrudController(VehicleColor);

// Chỉ EVM Staff & Admin được quản lý vehicle colors
router.get('/', protect, allowRoles('Dealer Staff', 'Dealer Manager', 'EVM Staff', 'Admin'), ctrl.list);
router.get('/:id', protect, allowRoles('Dealer Staff', 'Dealer Manager', 'EVM Staff', 'Admin'), ctrl.get);
router.post('/', protect, allowRoles('EVM Staff', 'Admin'), ctrl.create);
router.patch('/:id', protect, allowRoles('EVM Staff', 'Admin'), ctrl.update);
router.delete('/:id', protect, allowRoles('Admin'), ctrl.remove);

module.exports = router;
