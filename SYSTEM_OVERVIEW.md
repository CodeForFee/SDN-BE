# TỔNG QUAN HỆ THỐNG SDN-BE

## 🎯 Tổng quan
Hệ thống **Backend API** cho quản lý đại lý xe điện (Electric Vehicle Management - EVM), cung cấp API RESTful với xác thực JWT và phân quyền RBAC (Role-Based Access Control).

## 📋 Công nghệ sử dụng
- **Framework**: Express.js 5.1.0
- **Database**: MongoDB (Mongoose 8.18.3)
- **Authentication**: JWT (jsonwebtoken 9.0.2)
- **Security**: bcryptjs (hash password), CORS
- **Documentation**: Swagger UI
- **Environment**: dotenv

## 🏗️ Cấu trúc thư mục

```
SDN-BE/
├── index.js              # Entry point, khởi tạo server & routes
├── middleware/
│   └── authMiddleware.js # JWT authentication & role authorization
├── models/               # Mongoose schemas (15 models)
├── controllers/          # Business logic handlers
├── routes/              # API route definitions
├── utils/
│   ├── jwt.js           # Token generation & verification
│   └── hash.js          # Password hashing
├── seed.js              # Database seeding script
└── swagger.json         # API documentation
```

## 👥 Hệ thống phân quyền (4 roles)

### 1. **Admin** - Quản trị viên hệ thống
- Toàn quyền quản lý hệ thống
- CRUD users, dealers, vehicles
- Xem tất cả báo cáo, dashboard
- Quản lý inventory tổng

### 2. **EVMStaff** - Nhân viên hãng EVM
- Quản lý danh mục xe (models, variants, colors)
- Điều phối inventory giữa các đại lý
- Xem báo cáo tổng hợp
- Quản lý promotions toàn hệ thống

### 3. **DealerManager** - Quản lý đại lý
- Quản lý nhân viên của đại lý mình (tạo DealerStaff)
- Quản lý inventory của đại lý
- Duyệt/giám sát orders, quotes, payments
- Xem báo cáo của đại lý mình

### 4. **DealerStaff** - Nhân viên bán hàng
- Tư vấn, tạo quotes, orders
- Quản lý customers (CRM)
- Tạo payments, deliveries
- Tạo feedbacks từ khách hàng

## 📊 Models (15 entities)

### Core Entities
1. **User** - Tài khoản người dùng (email, role, dealer)
2. **Dealer** - Đại lý (name, code, region, salesTarget)
3. **Customer** - Khách hàng (fullName, phone, email, segment)

### Product Entities
4. **VehicleModel** - Mẫu xe (name, brand, segment)
5. **VehicleVariant** - Phiên bản xe (trim, battery, range, msrp)
6. **VehicleColor** - Màu sắc xe (name, code, hex, extraPrice)

### Inventory & Sales
7. **Inventory** - Tồn kho (ownerType: EVM/Dealer, variant, color, quantity)
8. **Promotion** - Khuyến mãi (type, value, scope, validFrom/To)

### Sales Process
9. **Quote** - Báo giá (customer, items, total, status: draft/sent/accepted)
10. **Order** - Đơn hàng (orderNo, status: new/confirmed/allocated/invoiced/delivered)
11. **Payment** - Thanh toán (type: deposit/balance/finance, status: pending/confirmed)
12. **Delivery** - Giao xe (scheduledAt, status: pending/in_progress/delivered)
13. **SalesContract** - Hợp đồng bán xe (contractNo, signedDate, files)

### Supporting
14. **TestDrive** - Lái thử (preferredTime, status, result)
15. **Feedback** - Phản hồi khách hàng (content, status: new/in_progress/resolved)

## 🔄 Flow nghiệp vụ chính

### Flow bán hàng chuẩn (DealerStaff → DealerManager)

```
1. Đăng nhập
   POST /api/auth/login
   → Nhận token, refreshToken, user info (role, dealer)

2. Tư vấn khách hàng
   GET /api/vehicles           # Xem danh mục xe
   GET /api/vehicles/compare   # So sánh 2-3 variants
   GET /api/promotions         # Xem khuyến mãi

3. CRM - Quản lý khách hàng
   POST /api/customers         # Tạo khách hàng mới
   GET /api/customers          # Tìm kiếm khách hàng

4. Tạo báo giá
   POST /api/quotes            # Tạo quote (status: draft)
   PATCH /api/quotes/:id       # Cập nhật quote
   PUT /api/quotes/:id/convert # Chuyển quote → order

5. Tạo đơn hàng (nếu không từ quote)
   POST /api/orders            # Tạo order (status: new)
   
6. Manager duyệt đơn
   PUT /api/orders/:id/status  # DealerManager: new → confirmed

7. Thanh toán
   POST /api/payments          # Tạo payment (status: pending)
   PUT /api/payments/:id/status # Manager xác nhận payment
   PUT /api/orders/:id/payment # Gắn payment vào order log

8. Giao xe
   POST /api/deliveries        # Tạo phiếu giao
   PUT /api/deliveries/:id/status # Cập nhật tiến độ
   PUT /api/orders/:id/delivery # Gắn delivery vào order
   PUT /api/orders/:id/status  # delivered

9. Hợp đồng
   POST /api/contracts         # Tạo hợp đồng
   PUT /api/contracts/:id      # Ký hợp đồng (signedDate, files)

10. Phản hồi
    POST /api/feedbacks        # Tạo feedback từ khách
    PUT /api/feedbacks/:id/status # Manager xử lý feedback
```

### Flow quản lý inventory (EVMStaff)

```
1. Xem tồn kho tổng
   GET /api/inventory          # Tất cả inventory (EVM + Dealers)

2. Điều phối giữa đại lý
   POST /api/inventory/transfer
   {
     fromDealer: dealerId,
     toDealer: dealerId,
     variant: variantId,
     color: colorId,
     quantity: number
   }

3. Cập nhật tồn kho
   PUT /api/inventory/:id      # Cập nhật quantity
```

### Flow quản lý đại lý (Admin/EVMStaff)

```
1. Tạo đại lý
   POST /api/dealers           # Admin only

2. Đặt chỉ tiêu
   PUT /api/dealers/:id/target # Cập nhật salesTarget

3. Xem báo cáo đại lý
   GET /api/reports/sales      # Doanh số
   GET /api/reports/debt       # Công nợ
   GET /api/dashboard/summary  # Tổng quan
```

## 🔐 Xác thực & Bảo mật

### Authentication Flow
```
1. POST /api/auth/login
   Body: { email, password }
   Response: { token, refreshToken, user }

2. Gửi token trong header
   Authorization: Bearer <token>

3. Refresh token khi hết hạn
   POST /api/auth/refresh
   Body: { refreshToken }
   Response: { token, refreshToken (mới) }
```

### Middleware Protection
- `protect`: Kiểm tra JWT token hợp lệ → gán `req.user`
- `allowRoles(...roles)`: Kiểm tra role có trong danh sách cho phép

### Tự động lọc theo Dealer
- DealerStaff/DealerManager chỉ thấy dữ liệu của `dealer` mình
- Filter tự động: `filter.dealer = req.user.dealer`

## 📡 API Endpoints chính

### Authentication
- `POST /api/auth/login` - Đăng nhập (public)
- `POST /api/auth/register` - Tạo user (Admin/DealerManager)
- `GET /api/auth/me` - Lấy profile hiện tại
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout

### Vehicles
- `GET /api/vehicles` - Danh sách variants
- `GET /api/vehicles/:id` - Chi tiết variant
- `GET /api/vehicles/compare?ids=a,b,c` - So sánh variants
- `GET/POST/PATCH/DELETE /api/vehicle-models` - CRUD models
- `GET/POST/PATCH/DELETE /api/vehicle-colors` - CRUD colors

### Dealers
- `GET /api/dealers` - Danh sách đại lý
- `GET /api/dealers/:id` - Chi tiết đại lý
- `POST /api/dealers` - Tạo đại lý (Admin)
- `PATCH /api/dealers/:id` - Cập nhật (Manager/Admin)
- `PUT /api/dealers/:id/target` - Cập nhật chỉ tiêu

### Inventory
- `GET /api/inventory` - Tồn kho (tự lọc theo dealer)
- `POST /api/inventory` - Tạo mục tồn
- `PUT /api/inventory/:id` - Cập nhật số lượng
- `POST /api/inventory/transfer` - Điều phối (EVMStaff)

### Customers
- `GET /api/customers` - Danh sách khách hàng
- `POST /api/customers` - Tạo khách hàng
- `GET/PATCH/DELETE /api/customers/:id` - CRUD chi tiết

### Quotes
- `GET /api/quotes` - Danh sách báo giá
- `POST /api/quotes` - Tạo báo giá
- `PUT /api/quotes/:id/convert` - Chuyển thành order

### Orders
- `GET /api/orders` - Danh sách đơn hàng
- `POST /api/orders` - Tạo đơn hàng
- `PUT /api/orders/:id/status` - Cập nhật trạng thái
- `PUT /api/orders/:id/payment` - Gắn payment
- `PUT /api/orders/:id/delivery` - Gắn delivery

### Payments
- `POST /api/payments` - Tạo thanh toán
- `GET /api/payments/:orderId` - Thanh toán theo đơn
- `PUT /api/payments/:id/status` - Xác nhận thanh toán

### Deliveries
- `POST /api/deliveries` - Tạo phiếu giao
- `PUT /api/deliveries/:id/status` - Cập nhật tiến độ

### Contracts
- `GET/POST /api/contracts` - Danh sách/Tạo hợp đồng
- `PUT /api/contracts/:id` - Cập nhật hợp đồng

### Promotions
- `GET /api/promotions` - Danh sách khuyến mãi
- `POST/PUT/DELETE /api/promotions` - Quản lý (EVMStaff/Admin)

### Reports & Dashboard
- `GET /api/reports/sales` - Báo cáo doanh số
- `GET /api/reports/debt` - Báo cáo công nợ
- `GET /api/reports/inventory` - Báo cáo tồn kho
- `GET /api/dashboard/summary` - Tổng quan (Admin/EVMStaff)
- `GET /api/dashboard/trends` - Xu hướng (Manager/EVMStaff)

### Users
- `GET /api/users` - Danh sách users (Admin/EVMStaff)
- `PUT /api/users/:id` - Cập nhật user
- `DELETE /api/users/:id` - Xóa user (Admin)

## 🔍 Đặc điểm kỹ thuật

### Response Format
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {...},
  "count": 10
}
```

### Error Format
```json
{
  "message": "Error description"
}
```

### Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized (no token/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

### Database Indexes
- `User.email` - Unique index
- `User.dealer` - Index for filtering
- `VehicleVariant.model + trim` - Unique
- `Inventory.ownerType + owner + variant + color` - Unique (sparse)
- `Order.orderNo` - Index
- `SalesContract.contractNo` - Index

## 🚀 Deployment

### Environment Variables
```env
PORT=5000
MONGO_URI=mongodb://...
JWT_SECRET=your-secret-key
NODE_ENV=production
```

### Scripts
- `npm start` - Chạy production
- `npm run dev` - Chạy development (nodemon)
- `npm run seed` - Seed dữ liệu mẫu

### Health Check
- `GET /health` - Kiểm tra server status

### Documentation
- `GET /api-docs` - Swagger UI documentation

## 📝 Ghi chú quan trọng

1. **Auto-filtering**: DealerStaff/DealerManager tự động chỉ thấy dữ liệu của dealer mình
2. **Role validation**: Mỗi route có middleware `allowRoles()` kiểm tra quyền
3. **Quote → Order**: Có endpoint riêng `PUT /api/quotes/:id/convert` để chuyển đổi
4. **Order logs**: Mọi thay đổi status/payment/delivery đều ghi vào `order.logs[]`
5. **Inventory ownership**: `ownerType` = "EVM" hoặc "Dealer", `owner` = dealerId khi là Dealer
6. **VIN tracking**: Mỗi order item có `vins[]` để track số khung cụ thể
7. **Token blacklist**: Refresh token cũ được blacklist khi refresh mới (in-memory, nên dùng Redis trong production)

## 🔗 Luồng dữ liệu chính

```
Customer → Quote → Order → Payment → Delivery → Contract
                              ↓
                         Inventory (reserve)
                              ↓
                         SalesContract
```

**Workflow States:**
- Quote: `draft → sent → accepted/rejected`
- Order: `new → confirmed → allocated → invoiced → delivered`
- Payment: `pending → confirmed/failed`
- Delivery: `pending → in_progress → delivered`
- Contract: `draft → signed → cancelled`

