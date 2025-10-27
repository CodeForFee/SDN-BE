const express = require('express');
const Dealer = require('../models/Dealer');
const createCrudController = require('../controllers/crudController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roles');

const router = express.Router();
const ctrl = createCrudController(Dealer);

// Dealer Manager, EVM Staff & Admin có thể xem đại lý
router.get('/', protect, allowRoles('DealerManager', 'EVMStaff', 'Admin'), ctrl.list);
router.get('/:id', protect, allowRoles('DealerManager', 'EVMStaff', 'Admin'), ctrl.get);

// Chỉ Admin tạo mới đại lý
router.post('/', protect, allowRoles('Admin'), ctrl.create);

// Dealer Manager có thể cập nhật thông tin đại lý của mình, Admin có thể cập nhật tất cả
router.patch('/:id', protect, allowRoles('DealerManager', 'Admin'), ctrl.update);

// Chỉ Admin xóa đại lý
router.delete('/:id', protect, allowRoles('Admin'), ctrl.remove);

module.exports = router;

