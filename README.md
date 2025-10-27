# Electric Vehicle Dealer Management System API

Phần mềm quản lý bán xe điện thông qua kênh đại lý

## 🚀 Cài Đặt

```bash
npm install
```

## ⚙️ Cấu Hình

Tạo file `.env` với nội dung:
```
MONGO_URI=your_mongodb_connection_string
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret
```

## 📊 Seed Database

```bash
npm run seed
```

Seed data bao gồm:
- 6 users (Admin, EVM Staff, Dealer Managers)
- 3 dealers (Hanoi, HCM, Da Nang)
- 5 customers
- 3 vehicle models (VF6, VF8, VF9)
- 4 vehicle variants
- 4 vehicle colors
- Sample orders, quotes, inventory, promotions, etc.

## 🔑 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@evms.com | 123456 |
| EVM Staff | evm.staff@evms.com | 123456 |
| Hanoi Manager | hanoi.manager@evdealer.com | 123456 |
| Hanoi Staff | hanoi.staff1@evdealer.com | 123456 |
| HCM Manager | hcm.manager@evdealer.com | 123456 |
| Da Nang Manager | danang.manager@evdealer.com | 123456 |

## 🏃 Chạy Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## 📚 API Documentation

Swagger UI: `http://localhost:5000/api-docs`

## 🎯 Chức Năng Chính

### 1. Cho Đại Lý (Dealer Staff, Dealer Manager)

#### a. Truy vấn thông tin xe
- `GET /api/vehicles/models` - Xem danh mục xe
- `GET /api/vehicles/variants` - Xem cấu hình xe
- `GET /api/vehicles/colors` - Xem màu sắc

#### b. Quản lý bán hàng
- `POST /api/quotes` - Tạo báo giá
- `POST /api/orders` - Tạo đơn hàng
- `POST /api/contracts` - Tạo hợp đồng bán hàng
- `GET /api/promotions` - Xem khuyến mãi
- `POST /api/payments` - Quản lý thanh toán

#### c. Quản lý khách hàng
- `POST /api/customers` - Thêm khách hàng
- `GET /api/customers` - Xem danh sách khách hàng
- `POST /api/test-drives` - Đặt lịch lái thử
- `POST /api/complaints` - Ghi nhận khiếu nại

#### d. Báo cáo
- `GET /api/reports/sales` - Báo cáo doanh số
- `GET /api/reports/ar-aging` - Báo cáo công nợ

### 2. Cho Hãng Xe (EVM Staff, Admin)

#### a. Quản lý sản phẩm & phân phối
- `POST /api/vehicles/models` - Thêm mẫu xe
- `POST /api/vehicles/variants` - Thêm phiên bản
- `POST /api/vehicles/colors` - Thêm màu sắc
- `GET /api/inventory/global` - Xem tồn kho tổng
- `POST /api/allocations` - Điều phối xe cho đại lý
- `POST /api/price-policies` - Quản lý giá sỉ

#### b. Quản lý đại lý
- `POST /api/dealers` - Thêm đại lý
- `GET /api/dealers` - Xem danh sách đại lý
- `POST /api/dealer-contracts` - Tạo hợp đồng đại lý
- `POST /api/dealer-targets` - Thiết lập chỉ tiêu

#### c. Báo cáo & phân tích
- `GET /api/reports/sales` - Doanh số theo đại lý
- `GET /api/reports/inventory/turnover` - Báo cáo tồn kho

## 🗂️ Cấu Trúc Database

### Core Models
- **User**: Tài khoản người dùng (Admin, EVM Staff, Dealer Manager, Dealer Staff)
- **Dealer**: Đại lý
- **Customer**: Khách hàng

### Vehicle Models
- **VehicleModel**: Mẫu xe (VF6, VF8, VF9)
- **VehicleVariant**: Phiên bản xe (Standard, Premium, Luxury)
- **VehicleColor**: Màu sắc xe

### Sales Models
- **Quote**: Báo giá
- **Order**: Đơn hàng
- **SalesContract**: Hợp đồng bán hàng
- **Payment**: Thanh toán

### Inventory & Distribution
- **Inventory**: Tồn kho
- **Allocation**: Phân phối xe

### Marketing & Support
- **Promotion**: Khuyến mãi
- **TestDrive**: Lái thử
- **Complaint**: Khiếu nại

### Dealer Management
- **DealerContract**: Hợp đồng đại lý
- **DealerTarget**: Chỉ tiêu doanh số
- **PricePolicy**: Chính sách giá

## 🔐 Authentication

API sử dụng JWT authentication. Để sử dụng protected endpoints:

1. Login để lấy token:
```bash
POST /api/auth/login
{
  "email": "admin@evms.com",
  "password": "123456"
}
```

2. Sử dụng token trong header:
```
Authorization: Bearer <your_token>
```

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose
- **Authentication**: JWT, bcryptjs
- **Documentation**: Swagger UI
- **Development**: Nodemon

## 📝 Notes

- Tất cả API endpoints đều có role-based access control
- Dealer Staff chỉ xem được data của dealer mình
- EVM Staff & Admin có quyền truy cập toàn bộ hệ thống
- Password mặc định cho test accounts: `123456`

## 🐛 Troubleshooting

### Lỗi kết nối MongoDB
Kiểm tra `MONGO_URI` trong file `.env`

### Lỗi authentication
Đảm bảo token JWT còn hiệu lực và đúng format

### Lỗi validation
Kiểm tra required fields trong Swagger documentation

## 📧 Support

Liên hệ team phát triển để được hỗ trợ.
