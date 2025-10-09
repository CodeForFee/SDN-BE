const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventoryController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roles");

// Xem tồn kho
router.get(
  "/",
  protect,
  authorizeRoles("Dealer Manager", "EVM Staff", "Admin"),
  inventoryController.getInventory
);

// Quản lý tồn kho chỉ EVM Staff & Admin
router.post(
  "/",
  protect,
  authorizeRoles("EVM Staff", "Admin"),
  inventoryController.createInventory
);
router.put(
  "/:id",
  protect,
  authorizeRoles("EVM Staff", "Admin"),
  inventoryController.updateInventory
);
router.delete(
  "/:id",
  protect,
  authorizeRoles("Admin"),
  inventoryController.deleteInventory
);

module.exports = router;
