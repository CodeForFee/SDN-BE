const express = require('express');
const contractController = require('../controllers/contractController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Dealer Staff, Dealer Manager quản lý hợp đồng bán hàng
router.get('/', protect, allowRoles('DealerStaff', 'DealerManager', 'Admin'), contractController.getContracts);
router.get('/:id', protect, allowRoles('DealerStaff', 'DealerManager', 'Admin'), contractController.getContractById);
router.post('/', protect, allowRoles('DealerStaff', 'DealerManager', 'Admin'), contractController.createContract);
router.put('/:id', protect, allowRoles('DealerManager', 'Admin'), contractController.updateContract);
router.patch('/:id', protect, allowRoles('DealerManager', 'Admin'), contractController.updateContract);

module.exports = router;

