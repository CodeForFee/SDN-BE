const express = require('express');
const Quote = require('../models/Quote');
const createCrudController = require('../controllers/crudController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roles');

const router = express.Router();
const ctrl = createCrudController(Quote);

// Dealer Staff, Dealer Manager quản lý báo giá
router.get('/', protect, allowRoles('DealerStaff', 'DealerManager', 'Admin'), ctrl.list);
router.get('/:id', protect, allowRoles('DealerStaff', 'DealerManager', 'Admin'), ctrl.get);
router.post('/', protect, allowRoles('DealerStaff', 'DealerManager', 'Admin'), ctrl.create);
router.patch('/:id', protect, allowRoles('DealerStaff', 'DealerManager', 'Admin'), ctrl.update);
router.delete('/:id', protect, allowRoles('Admin'), ctrl.remove);

module.exports = router;

