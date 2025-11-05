# SDN-BE — Electric Vehicle Dealer Management API

Hệ thống BE cho quản trị hãng xe điện (EVM) và kênh đại lý. Cung cấp API RBAC phục vụ FE (Next.js) theo các luồng: danh mục xe, đại lý, tồn kho, CRM, báo giá → đơn hàng → thanh toán → giao xe → hợp đồng, phản hồi, báo cáo, dashboard.

## Liên kết nhanh
- Swagger UI: `/api-docs` (trên máy: `http://localhost:5000/api-docs`)
- Health check: `/health`
- Root info: `/`

## Roles & Quyền tổng quát
- Admin: Toàn quyền hệ thống (EVM + Dealer)
- EVMStaff: Quản lý danh mục xe, tồn kho tổng, đại lý, khuyến mãi, báo cáo
- DealerManager: Quản lý đại lý của mình (nhân sự, khách, đơn, tồn kho, báo cáo)
- DealerStaff: Bán hàng tại đại lý (khách, báo giá, đơn hàng, thanh toán, giao xe, phản hồi)

## Xác thực & Header
- Bearer JWT: `Authorization: Bearer <token>`
- Đăng nhập: `POST /api/auth/login`
- Lấy hồ sơ: `GET /api/auth/me`
- Refresh token: `POST /api/auth/refresh`

## Biến môi trường (tham khảo)
- `PORT` (default 5000)
- `MONGO_URI` (MongoDB connection string)
- `JWT_SECRET` (bí mật ký JWT)

## Quy ước phản hồi lỗi (ví dụ)
```json
{ "message": "Mô tả lỗi" }
```

---

## Module & Endpoints chính (tóm tắt cho FE)

### 1) Auth & Users
- POST `/api/auth/login` — Đăng nhập (All)
- GET `/api/auth/me` — Lấy hồ sơ hiện tại (All)
- POST `/api/auth/register` — Tạo user (Admin, DealerManager tạo DealerStaff)
- GET `/api/users` — Danh sách tài khoản (Admin, EVMStaff)
- PUT `/api/users/{id}` — Cập nhật user (Admin, DealerManager phạm vi đại lý)
- DELETE `/api/users/{id}` — Xóa user (Admin)

### 2) Vehicles (Model/Variant/Color)
- Variant (đọc tất cả):
  - GET `/api/vehicles` — Liệt kê variants (All)
  - GET `/api/vehicles/{id}` — Chi tiết variant (All)
  - GET `/api/vehicles/compare?ids=a,b,c` — So sánh 2–3 variants (DealerStaff, DealerManager)
- Variant (CRUD): POST/PUT/DELETE (EVMStaff, Admin)
- Model:
  - GET/POST `/api/vehicle-models` (Read: EVMStaff, Admin; Create: EVMStaff, Admin)
  - GET/PATCH/DELETE `/api/vehicle-models/{id}` (EVMStaff, Admin; Delete: Admin)
- Color: tương tự `/api/vehicle-colors`

### 3) Dealers
- GET `/api/dealers` — Danh sách (Admin, EVMStaff, DealerManager)
- GET `/api/dealers/{id}` — Chi tiết (Admin, EVMStaff, DealerManager)
- POST `/api/dealers` — Tạo (Admin)
- PATCH `/api/dealers/{id}` — Cập nhật (DealerManager đại lý mình, Admin)
- DELETE `/api/dealers/{id}` — Xóa (Admin)
- GET `/api/dealers/{id}/inventory` — Tồn kho tại đại lý (DealerManager, EVMStaff)
- PUT `/api/dealers/{id}/target` — Cập nhật chỉ tiêu (Admin, EVMStaff)

### 4) Inventory
- GET `/api/inventory` — Tồn kho (DealerStaff/DealerManager/EVMStaff/Admin)
- POST `/api/inventory` — Tạo mục tồn (DealerManager, EVMStaff, Admin)
- PUT `/api/inventory/{id}` — Cập nhật số lượng (DealerManager, EVMStaff, Admin)
- DELETE `/api/inventory/{id}` — Xóa (Admin)
- GET `/api/inventory/dealer/{dealerId}` — Tồn kho theo đại lý (DealerManager, EVMStaff)
- POST `/api/inventory/transfer` — Điều phối giữa đại lý (EVMStaff)

### 5) Customers (CRM)
- GET/POST `/api/customers` — Danh sách/Tạo (DealerStaff, DealerManager, Admin)
- GET/PATCH `/api/customers/{id}` — Chi tiết/Cập nhật (DealerStaff, DealerManager, Admin)
- DELETE `/api/customers/{id}` — Xóa (Admin hoặc theo quy trình quản trị)

### 6) Quotes
- GET/POST `/api/quotes` — Danh sách/Tạo (DealerStaff, DealerManager, Admin)
- GET/PATCH/DELETE `/api/quotes/{id}` — Chi tiết/Cập nhật/Xóa
- PUT `/api/quotes/{id}/convert` — Chuyển báo giá thành đơn hàng (DealerStaff, DealerManager)

### 7) Orders
- GET/POST `/api/orders` — Danh sách/Tạo (DealerStaff, DealerManager, Admin)
- GET/PATCH/DELETE `/api/orders/{id}` — Chi tiết/Cập nhật/Xóa (Delete: DealerManager/Admin)
- PUT `/api/orders/{id}/status` — Cập nhật trạng thái (DealerManager, EVMStaff)
- PUT `/api/orders/{id}/payment` — Gắn thanh toán vào log đơn (DealerStaff, DealerManager)
- PUT `/api/orders/{id}/delivery` — Gắn thông tin giao xe (DealerStaff, DealerManager)

### 8) Payments
- POST `/api/payments` — Tạo thanh toán (DealerStaff, DealerManager)
- GET `/api/payments/{orderId}` — Lấy thanh toán theo đơn (DealerStaff, DealerManager)
- PUT `/api/payments/{id}/status` — Cập nhật trạng thái (DealerManager)

### 9) Deliveries (Giao xe)
- POST `/api/deliveries` — Tạo phiếu giao xe (DealerStaff)
- PUT `/api/deliveries/{id}/status` — Cập nhật tiến độ (DealerManager)
- GET `/api/deliveries/{orderId}` — Xem phiếu giao theo đơn (DealerStaff, DealerManager)

### 10) Contracts (Hợp đồng)
- GET/POST `/api/contracts` — Danh sách/Tạo (DealerStaff, DealerManager, Admin)
- GET `/api/contracts/{id}` — Chi tiết (DealerStaff, DealerManager, Admin)
- PUT `/api/contracts/{id}` — Cập nhật (DealerManager, Admin)

### 11) Promotions
- GET `/api/promotions` — Danh sách (DealerStaff, DealerManager, EVMStaff, Admin)
- POST/PUT/DELETE — Quản lý (EVMStaff, Admin)

### 12) Test Drives
- GET/POST `/api/test-drives` — Danh sách/Tạo (DealerStaff, DealerManager, Admin)
- GET/PATCH/DELETE `/api/test-drives/{id}` — Chi tiết/Cập nhật/Xóa

### 13) Feedbacks
- GET `/api/feedbacks` — Danh sách (DealerManager)
- POST `/api/feedbacks` — Tạo phản hồi (DealerStaff)
- PUT `/api/feedbacks/{id}/status` — Cập nhật xử lý (DealerManager)

### 14) Reports & Dashboard
- Reports: `GET /api/reports/sales`, `GET /api/reports/debt`, `GET /api/reports/inventory` (DealerManager, EVMStaff, Admin)
- Dashboard: `GET /api/dashboard/summary` (Admin, EVMStaff), `GET /api/dashboard/trends` (DealerManager, EVMStaff)

---

## Luồng nghiệp vụ chính (theo code hiện tại)
1. Đăng nhập → lấy `token`, `me` để biết `role`, `dealer`
2. Tư vấn xe: xem `vehicles`, `vehicles/compare`, áp `promotions`
3. CRM: tạo/chọn `customer`
4. Báo giá: `POST /quotes` → cập nhật → `PUT /quotes/{id}/convert`
5. Đơn hàng: `POST /orders` → `PUT /orders/{id}/status`
6. Thanh toán: `POST /payments` → `PUT /payments/{id}/status` → `PUT /orders/{id}/payment`
7. Giao xe: `POST /deliveries` → `PUT /deliveries/{id}/status` → `PUT /orders/{id}/delivery`
8. Hợp đồng: `POST /contracts` / `PUT /contracts/{id}`
9. Phản hồi: `POST /feedbacks` → `PUT /feedbacks/{id}/status`
10. Báo cáo/Dashboard: báo cáo doanh số/công nợ/tồn kho, summary/trends

## Ghi chú tích hợp FE (ngắn gọn)
- Gửi header `Authorization: Bearer <token>` cho mọi API trừ login/refresh.
- Một số API tự lọc theo `req.user.dealer` (DealerManager/DealerStaff).
- Lỗi: 401 (chưa đăng nhập), 403 (sai quyền), 404 (không thấy), 400/500 (dữ liệu/lỗi server).

---

## Flow nghiệp vụ theo từng vai trò

### Admin
- Người dùng: tạo/cập nhật/xóa user; xem danh sách users.
- Đại lý: tạo/cập nhật/xóa đại lý; xem tồn kho theo đại lý; đặt chỉ tiêu doanh số.
- Vehicles: CRUD models/variants/colors.
- Báo cáo/Dashboard: xem toàn cục.

Quy trình điển hình:
1) Đăng nhập → GET `/api/auth/me`.
2) Tạo user mới (khi cần) → POST `/api/auth/register`.
3) Quản trị đại lý → POST/PATCH/DELETE `/api/dealers`.
4) Thiết lập chỉ tiêu → PUT `/api/dealers/{id}/target`.
5) Giám sát hệ thống → GET `/api/dashboard/summary`, `/api/reports/*`.

### EVM Staff
- Vehicles: CRUD model/variant/color phục vụ bán hàng.
- Inventory: xem tổng; điều phối giữa đại lý (transfer).
- Dealers: cập nhật chỉ tiêu doanh số.
- Báo cáo/Dashboard: theo dõi hiệu suất hệ thống.

Quy trình điển hình:
1) Đăng nhập → GET `/api/auth/me`.
2) Quản lý danh mục xe → `/api/vehicle-models`, `/api/vehicles`, `/api/vehicle-colors`.
3) Điều phối tồn kho → POST `/api/inventory/transfer` (thiếu hàng tại đại lý).
4) Cập nhật target đại lý (nếu có) → PUT `/api/dealers/{id}/target`.
5) Theo dõi báo cáo → GET `/api/reports/*`, `/api/dashboard/*`.

### Dealer Manager
- Users (đại lý mình): tạo DealerStaff, cập nhật user.
- Inventory (đại lý mình): tạo/cập nhật mục tồn; xem tồn kho đại lý.
- Customers/Quotes/Orders: CRUD trong phạm vi đại lý; duyệt tiến trình.
- Payments: xác nhận trạng thái thanh toán.
- Deliveries: cập nhật tiến độ giao xe.
- Feedbacks: xem và cập nhật trạng thái xử lý.
- Reports: xem doanh số/công nợ/tồn kho của đại lý.

Quy trình điển hình:
1) Đăng nhập → GET `/api/auth/me` (có `dealer`).
2) Quản lý đội ngũ → POST `/api/auth/register` (role DealerStaff) ràng buộc `dealer`.
3) Theo dõi báo giá/đơn hàng của đại lý → GET `/api/quotes`, `/api/orders`.
4) Duyệt tiến trình đơn → PUT `/api/orders/{id}/status`.
5) Xác nhận thanh toán → PUT `/api/payments/{id}/status`.
6) Cập nhật giao xe → PUT `/api/deliveries/{id}/status`.
7) Quản trị tồn kho đại lý → GET/POST/PUT `/api/inventory`, GET `/api/inventory/dealer/{dealerId}`.
8) Xử lý phản hồi khách → GET `/api/feedbacks` → PUT `/api/feedbacks/{id}/status`.
9) Xem báo cáo → GET `/api/reports/*`.

### Dealer Staff
- Vehicles: xem danh mục, so sánh 2–3 variant.
- CRM: tạo/cập nhật khách hàng.
- Quotes: tạo/cập nhật; convert báo giá thành đơn.
- Orders: tạo đơn; gắn thanh toán; gắn thông tin giao xe.
- Payments: tạo thanh toán; xem thanh toán theo đơn.
- Deliveries: tạo phiếu giao; xem giao hàng theo đơn.
- Feedbacks: tạo phản hồi khách hàng.

Quy trình điển hình:
1) Đăng nhập → GET `/api/auth/me` (biết `dealer`).
2) Tư vấn sản phẩm → GET `/api/vehicles`, `/api/vehicles/compare?ids=...`.
3) Tạo khách → POST `/api/customers`.
4) Tạo báo giá → POST `/api/quotes` → cần thì PATCH `/api/quotes/{id}`.
5) Chuyển báo giá → PUT `/api/quotes/{id}/convert` (tạo `order`).
6) Tạo thanh toán → POST `/api/payments` → (Manager xác nhận trạng thái).
7) Gắn thanh toán vào order log → PUT `/api/orders/{id}/payment`.
8) Tạo phiếu giao → POST `/api/deliveries` → gắn vào order → PUT `/api/orders/{id}/delivery`.
9) Sau bán: POST `/api/feedbacks`.
