# BUSINESS FLOW - SDN-BE

## 📊 Sơ đồ luồng nghiệp vụ chính

### 1. Flow Bán Hàng Hoàn Chỉnh

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLOW BÁN HÀNG (SALES FLOW)                   │
└─────────────────────────────────────────────────────────────────┘

[DealerStaff]
    │
    ├─→ 1. Tư vấn khách hàng
    │   ├─ GET /api/vehicles          (Xem danh mục)
    │   ├─ GET /api/vehicles/compare  (So sánh)
    │   └─ GET /api/promotions        (Khuyến mãi)
    │
    ├─→ 2. Quản lý khách hàng (CRM)
    │   ├─ POST /api/customers        (Tạo khách mới)
    │   └─ GET /api/customers         (Tìm kiếm)
    │
    ├─→ 3. Tạo báo giá
    │   ├─ POST /api/quotes           (status: draft)
    │   ├─ PATCH /api/quotes/:id      (Chỉnh sửa)
    │   └─ PUT /api/quotes/:id/convert → Tạo Order
    │
    ├─→ 4. Tạo đơn hàng
    │   └─ POST /api/orders           (status: new)
    │
    └─→ [Chờ DealerManager duyệt]

[DealerManager]
    │
    ├─→ 5. Duyệt đơn hàng
    │   └─ PUT /api/orders/:id/status  (new → confirmed)
    │
    ├─→ 6. Xác nhận thanh toán
    │   ├─ PUT /api/payments/:id/status (pending → confirmed)
    │   └─ PUT /api/orders/:id/payment (Gắn payment)
    │
    └─→ 7. Theo dõi giao xe
        └─ PUT /api/deliveries/:id/status

[DealerStaff]
    │
    ├─→ 8. Tạo thanh toán
    │   └─ POST /api/payments          (type: deposit/balance)
    │
    ├─→ 9. Tạo phiếu giao xe
    │   ├─ POST /api/deliveries
    │   └─ PUT /api/orders/:id/delivery
    │
    ├─→ 10. Cập nhật trạng thái đơn
    │    └─ PUT /api/orders/:id/status (delivered)
    │
    └─→ 11. Tạo hợp đồng
         └─ POST /api/contracts       (contractNo, signedDate, files)
```

### 2. Flow Quản Lý Inventory

```
┌─────────────────────────────────────────────────────────────────┐
│                FLOW QUẢN LÝ TỒN KHO (INVENTORY)                 │
└─────────────────────────────────────────────────────────────────┘

[EVMStaff]
    │
    ├─→ 1. Xem tồn kho tổng
    │   └─ GET /api/inventory          (Tất cả: EVM + Dealers)
    │
    ├─→ 2. Điều phối giữa đại lý
    │   └─ POST /api/inventory/transfer
    │       {
    │         fromDealer: dealerId,
    │         toDealer: dealerId,
    │         variant: variantId,
    │         color: colorId,
    │         quantity: number
    │       }
    │
    └─→ 3. Cập nhật tồn kho tổng
        └─ PUT /api/inventory/:id      (Cập nhật quantity)

[DealerManager]
    │
    ├─→ 1. Xem tồn kho đại lý
    │   └─ GET /api/inventory          (Tự lọc theo dealer)
    │
    ├─→ 2. Thêm/xóa sản phẩm
    │   └─ POST /api/inventory         (Tạo mục tồn mới)
    │
    └─→ 3. Cập nhật số lượng
        └─ PUT /api/inventory/:id      (Khi nhận/xuất hàng)
```

### 3. Flow Quản Lý Đại Lý

```
┌─────────────────────────────────────────────────────────────────┐
│              FLOW QUẢN LÝ ĐẠI LÝ (DEALER MANAGEMENT)           │
└─────────────────────────────────────────────────────────────────┘

[Admin]
    │
    ├─→ 1. Tạo đại lý mới
    │   └─ POST /api/dealers           (name, code, region, address)
    │
    ├─→ 2. Đặt chỉ tiêu doanh số
    │   └─ PUT /api/dealers/:id/target (salesTarget)
    │
    ├─→ 3. Tạo quản lý đại lý
    │   └─ POST /api/auth/register     (role: DealerManager, dealer: id)
    │
    └─→ 4. Xem báo cáo tổng hợp
        ├─ GET /api/dashboard/summary
        └─ GET /api/reports/sales

[DealerManager]
    │
    ├─→ 1. Quản lý nhân viên
    │   └─ POST /api/auth/register     (role: DealerStaff, dealer: auto)
    │
    ├─→ 2. Xem báo cáo đại lý
    │   ├─ GET /api/reports/sales      (Doanh số đại lý)
    │   ├─ GET /api/reports/debt       (Công nợ)
    │   └─ GET /api/dashboard/trends   (Xu hướng)
    │
    └─→ 3. Cập nhật thông tin đại lý
        └─ PATCH /api/dealers/:id      (Chỉ đại lý của mình)
```

### 4. Flow Quản Lý Sản Phẩm

```
┌─────────────────────────────────────────────────────────────────┐
│           FLOW QUẢN LÝ SẢN PHẨM (PRODUCT MANAGEMENT)          │
└─────────────────────────────────────────────────────────────────┘

[EVMStaff / Admin]
    │
    ├─→ 1. Quản lý Model
    │   ├─ POST /api/vehicle-models    (Tạo model mới)
    │   ├─ GET /api/vehicle-models     (Danh sách)
    │   ├─ PATCH /api/vehicle-models/:id
    │   └─ DELETE /api/vehicle-models/:id (Admin only)
    │
    ├─→ 2. Quản lý Variant (Phiên bản)
    │   ├─ POST /api/vehicles          (Tạo variant cho model)
    │   ├─ GET /api/vehicles           (Tất cả variants)
    │   ├─ GET /api/vehicles/:id       (Chi tiết)
    │   └─ PUT/DELETE /api/vehicles/:id
    │
    ├─→ 3. Quản lý Màu sắc
    │   ├─ POST /api/vehicle-colors
    │   └─ GET/PATCH/DELETE /api/vehicle-colors/:id
    │
    └─→ 4. Quản lý Khuyến mãi
        ├─ POST /api/promotions        (type: cashback/accessory/finance)
        ├─ GET /api/promotions         (Tất cả roles xem được)
        └─ PUT/DELETE /api/promotions/:id
```

### 5. Flow Quản Lý Khách Hàng & Feedback

```
┌─────────────────────────────────────────────────────────────────┐
│         FLOW CRM & CUSTOMER FEEDBACK                            │
└─────────────────────────────────────────────────────────────────┘

[DealerStaff]
    │
    ├─→ 1. Tạo khách hàng mới
    │   └─ POST /api/customers         (fullName, phone, email, segment)
    │
    ├─→ 2. Quản lý khách hàng
    │   ├─ GET /api/customers          (Tìm kiếm, lọc)
    │   ├─ GET /api/customers/:id      (Chi tiết)
    │   └─ PATCH /api/customers/:id    (Cập nhật thông tin)
    │
    ├─→ 3. Đặt lịch lái thử
    │   └─ POST /api/test-drives       (variant, preferredTime)
    │
    └─→ 4. Thu thập phản hồi
        └─ POST /api/feedbacks         (content, status: new)

[DealerManager]
    │
    └─→ Xử lý phản hồi
        ├─ GET /api/feedbacks          (Danh sách phản hồi)
        └─ PUT /api/feedbacks/:id/status (new → in_progress → resolved)
```

## 🔄 Trạng thái nghiệp vụ (Status Flow)

### Quote Status
```
draft → sent → accepted
              ↓
           rejected
```

### Order Status
```
new → confirmed → allocated → invoiced → delivered
                                  ↓
                              cancelled
```

### Payment Status
```
pending → confirmed
       ↓
     failed
```

### Delivery Status
```
pending → in_progress → delivered
```

### Contract Status
```
draft → signed
      ↓
   cancelled
```

### Feedback Status
```
new → in_progress → resolved
```

### TestDrive Status
```
requested → confirmed → done
                    ↓
                cancelled
```

## 📈 Báo cáo & Dashboard

### Reports (GET /api/reports/*)
- **Sales Report**: Doanh số theo đại lý, variant, thời gian
- **Debt Report**: Công nợ của các đại lý
- **Inventory Report**: Tồn kho theo variant, đại lý

### Dashboard (GET /api/dashboard/*)
- **Summary**: Tổng quan hệ thống (Admin/EVMStaff)
- **Trends**: Xu hướng bán hàng, doanh số (DealerManager/EVMStaff)

## 🔐 Security & Permissions Matrix

| Action | Admin | EVMStaff | DealerManager | DealerStaff |
|--------|-------|----------|---------------|-------------|
| Tạo User | ✅ | ❌ | ✅ (DealerStaff only) | ❌ |
| Quản lý Dealers | ✅ | ❌ (Xem) | ❌ (Xem của mình) | ❌ |
| CRUD Vehicles | ✅ | ✅ | ❌ | ❌ (Xem) |
| Quản lý Inventory | ✅ (Tất cả) | ✅ (Tất cả + Transfer) | ✅ (Dealer mình) | ❌ (Xem) |
| Tạo Quote/Order | ✅ | ❌ | ✅ (Dealer mình) | ✅ (Dealer mình) |
| Duyệt Order | ✅ | ✅ | ✅ (Dealer mình) | ❌ |
| Tạo Payment | ✅ | ❌ | ✅ | ✅ |
| Xác nhận Payment | ✅ | ❌ | ✅ | ❌ |
| Tạo Delivery | ✅ | ❌ | ✅ | ✅ |
| Quản lý Contracts | ✅ | ❌ | ✅ (Dealer mình) | ✅ (Dealer mình) |
| Xem Reports | ✅ (Tất cả) | ✅ (Tất cả) | ✅ (Dealer mình) | ❌ |
| Dashboard | ✅ | ✅ | ✅ (Dealer mình) | ❌ |

## 🔗 Mối quan hệ Entities

```
VehicleModel (1) ──→ (N) VehicleVariant (1) ──→ (N) Inventory
                                                    │
                                                    ├─→ ownerType: "EVM"
                                                    └─→ ownerType: "Dealer" ──→ Dealer

Dealer (1) ──→ (N) User (DealerManager, DealerStaff)
          │
          ├─→ (N) Customer
          ├─→ (N) Quote
          ├─→ (N) Order
          ├─→ (N) Inventory
          └─→ (N) Feedback

Customer (1) ──→ (N) Quote ──→ (1) Order
                              │
                              ├─→ (N) Payment
                              ├─→ (1) Delivery
                              └─→ (1) SalesContract

Order (1) ──→ (N) OrderItem
  │             ├─→ variant: VehicleVariant
  │             └─→ color: VehicleColor
  │
  └─→ (N) logs[] { at, by, action, note }

Quote (1) ──→ (N) QuoteItem
              ├─→ variant: VehicleVariant
              ├─→ color: VehicleColor
              └─→ promotionApplied: Promotion[]
```

## 📝 Notes

1. **Auto-filtering**: DealerStaff/DealerManager tự động filter theo `req.user.dealer`
2. **Quote → Order**: Có endpoint riêng `/api/quotes/:id/convert` để chuyển đổi
3. **Order Logs**: Mọi thay đổi status/payment/delivery đều ghi vào `order.logs[]`
4. **VIN Tracking**: Mỗi order item có `vins[]` để track số khung cụ thể
5. **Inventory Ownership**: `ownerType` phân biệt EVM (tổng) và Dealer (đại lý)
6. **Promotion Scope**: Có thể `global`, `byDealer`, hoặc `byVariant`

