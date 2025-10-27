const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventoryController");
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roles");

// Dealer Staff có thể xem, Dealer Manager có thể quản lý tồn kho của đại lý mình
// EVM Staff & Admin quản lý toàn hệ thống
router.get(
  "/",
  protect,
  allowRoles("DealerStaff", "DealerManager", "EVMStaff", "Admin"),
  inventoryController.getInventory
);

// Dealer Manager có thể quản lý tồn kho của đại lý mình
// EVM Staff & Admin quản lý toàn hệ thống
router.post(
  "/",
  protect,
  allowRoles("DealerManager", "EVMStaff", "Admin"),
  inventoryController.createInventory
);
router.put(
  "/:id",
  protect,
  allowRoles("DealerManager", "EVMStaff", "Admin"),
  inventoryController.updateInventory
);
router.delete(
  "/:id",
  protect,
  allowRoles("Admin"),
  inventoryController.deleteInventory
);

module.exports = router;
