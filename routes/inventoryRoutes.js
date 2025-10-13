const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventoryController");
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roles");

// Xem tồn kho
router.get(
  "/",
  protect,
  allowRoles("Dealer Manager", "EVM Staff", "Admin"),
  inventoryController.getInventory
);

// Quản lý tồn kho chỉ EVM Staff & Admin
router.post(
  "/",
  protect,
  allowRoles("EVM Staff", "Admin"),
  inventoryController.createInventory
);
router.put(
  "/:id",
  protect,
  allowRoles("EVM Staff", "Admin"),
  inventoryController.updateInventory
);
router.delete(
  "/:id",
  protect,
  allowRoles("Admin"),
  inventoryController.deleteInventory
);

module.exports = router;
