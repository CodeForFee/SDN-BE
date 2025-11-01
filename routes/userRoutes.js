const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/authMiddleware');

router.get('/', protect, allowRoles('Admin', 'EVMStaff'), userController.listUsers);
router.put('/:id', protect, allowRoles('Admin', 'DealerManager'), userController.updateUser);
router.delete('/:id', protect, allowRoles('Admin'), userController.deleteUser);

module.exports = router;


