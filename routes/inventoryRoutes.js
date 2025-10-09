// inventory.js (hoặc file route tương ứng)
const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventoryController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roles");

/**
 * @swagger
 * tags:
 * - name: Inventory
 * description: Quản lý tồn kho xe
 */

/**
 * @swagger
 * components:
 * securitySchemes:
 * bearerAuth:
 * type: http
 * scheme: bearer
 * bearerFormat: JWT
 * schemas:
 * Inventory:
 * type: object
 * properties:
 * _id:
 * type: string
 * description: ID của bản ghi tồn kho
 * example: 60d5ec49f132e300155b9a7c
 * vehicle:
 * type: string
 * description: ID của mẫu xe (tham chiếu đến Vehicle Schema)
 * example: 60d5ec49f132e300155b9a7d
 * dealer:
 * type: string
 * description: ID của đại lý (tham chiếu đến Dealer Schema)
 * example: 60d5ec49f132e300155b9a7e
 * quantity:
 * type: number
 * description: Số lượng tồn kho tại đại lý
 * example: 15
 * required:
 * - vehicle
 * - dealer
 * InventoryCreateUpdate:
 * type: object
 * properties:
 * vehicle:
 * type: string
 * description: ID của mẫu xe
 * example: 60d5ec49f132e300155b9a7d
 * dealer:
 * type: string
 * description: ID của đại lý
 * example: 60d5ec49f132e300155b9a7e
 * quantity:
 * type: number
 * description: Số lượng tồn kho
 * example: 20
 * required:
 * - vehicle
 * - dealer
 * - quantity
 */

// ----------------------------------------------------------------------
// Xem tồn kho
// ----------------------------------------------------------------------
/**
 * @swagger
 * /inventory:
 * get:
 * summary: Lấy danh sách tồn kho
 * tags: [Inventory]
 * security:
 * - bearerAuth: []
 * description: |
 * Lấy danh sách tồn kho, yêu cầu xác thực và quyền hạn.
 * Roles cho phép: **Dealer Manager, EVM Staff, Admin**.
 * responses:
 * 200:
 * description: Danh sách tồn kho được trả về thành công.
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * $ref: '#/components/schemas/Inventory'
 * 401:
 * description: Chưa xác thực (Token không hợp lệ hoặc thiếu)
 * 403:
 * description: Không có quyền truy cập
 */
router.get(
  "/",
  protect,
  authorizeRoles("Dealer Manager", "EVM Staff", "Admin"),
  inventoryController.getInventory
);

// ----------------------------------------------------------------------
// Quản lý tồn kho (CREATE)
// ----------------------------------------------------------------------
/**
 * @swagger
 * /inventory:
 * post:
 * summary: Thêm bản ghi tồn kho mới
 * tags: [Inventory]
 * security:
 * - bearerAuth: []
 * description: |
 * Tạo mới một bản ghi tồn kho (số lượng xe của một mẫu xe tại một đại lý).
 * Roles cho phép: **EVM Staff, Admin**.
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/InventoryCreateUpdate'
 * responses:
 * 201:
 * description: Bản ghi tồn kho được tạo thành công.
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Inventory'
 * 401:
 * description: Chưa xác thực (Token không hợp lệ hoặc thiếu)
 * 403:
 * description: Không có quyền truy cập
 * 500:
 * description: Lỗi server
 */
router.post(
  "/",
  protect,
  authorizeRoles("EVM Staff", "Admin"),
  inventoryController.createInventory
);

// ----------------------------------------------------------------------
// Quản lý tồn kho (UPDATE)
// ----------------------------------------------------------------------
/**
 * @swagger
 * /inventory/{id}:
 * put:
 * summary: Cập nhật bản ghi tồn kho
 * tags: [Inventory]
 * security:
 * - bearerAuth: []
 * description: |
 * Cập nhật số lượng hoặc thông tin khác của bản ghi tồn kho theo ID.
 * Roles cho phép: **EVM Staff, Admin**.
 * parameters:
 * - in: path
 * - name: id
 * schema:
 * type: string
 * required: true
 * description: ID của bản ghi tồn kho cần cập nhật
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/InventoryCreateUpdate'
 * responses:
 * 200:
 * description: Bản ghi tồn kho được cập nhật thành công.
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Inventory'
 * 401:
 * description: Chưa xác thực
 * 403:
 * description: Không có quyền truy cập
 * 404:
 * description: Không tìm thấy bản ghi tồn kho
 */
router.put(
  "/:id",
  protect,
  authorizeRoles("EVM Staff", "Admin"),
  inventoryController.updateInventory
);

// ----------------------------------------------------------------------
// Quản lý tồn kho (DELETE)
// ----------------------------------------------------------------------
/**
 * @swagger
 * /inventory/{id}:
 * delete:
 * summary: Xóa bản ghi tồn kho
 * tags: [Inventory]
 * security:
 * - bearerAuth: []
 * description: |
 * Xóa một bản ghi tồn kho khỏi hệ thống.
 * Role cho phép: **Admin**.
 * parameters:
 * - in: path
 * - name: id
 * schema:
 * type: string
 * required: true
 * description: ID của bản ghi tồn kho cần xóa
 * responses:
 * 200:
 * description: Bản ghi tồn kho đã được xóa thành công.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message:
 * type: string
 * example: Inventory removed
 * 401:
 * description: Chưa xác thực
 * 403:
 * description: Không có quyền truy cập (chỉ Admin)
 * 404:
 * description: Không tìm thấy bản ghi tồn kho
 */
router.delete(
  "/:id",
  protect,
  authorizeRoles("Admin"),
  inventoryController.deleteInventory
);

module.exports = router;
