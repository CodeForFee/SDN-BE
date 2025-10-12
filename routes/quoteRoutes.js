const express = require("express");
const router = express.Router();
const quoteController = require("../controllers/quoteController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roles");

// Dealer Staff/Manager tạo và quản lý báo giá
router.get(
  "/",
  protect,
  authorizeRoles("Dealer Staff", "Dealer Manager", "Admin"),
  quoteController.getQuotes
);
router.post(
  "/",
  protect,
  authorizeRoles("Dealer Staff", "Dealer Manager"),
  quoteController.createQuote
);
router.get(
  "/:id",
  protect,
  authorizeRoles("Dealer Staff", "Dealer Manager", "Admin"),
  quoteController.getQuoteById
);
router.put(
  "/:id",
  protect,
  authorizeRoles("Dealer Manager", "Admin"),
  quoteController.updateQuote
);
router.delete(
  "/:id",
  protect,
  authorizeRoles("Dealer Manager", "Admin"),
  quoteController.deleteQuote
);

module.exports = router;
