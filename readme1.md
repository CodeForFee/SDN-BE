## Tài liệu schema (SDN-BE/models) dành cho FE

Mỗi model bên dưới là Mongoose schema, FE có thể dựa vào để map DTO, validate form và hiển thị. Tất cả schema đều có `createdAt`, `updatedAt` do `{ timestamps: true }` bật sẵn.

### User
- **email**: String, required, unique
- **passwordHash**: String, required
- **role**: String, required, enum: `DealerStaff | DealerManager | EVMStaff | Admin`
- **dealer**: ObjectId ref `Dealer` (tùy chọn, khi user thuộc đại lý)
- **profile**: { name: String, phone: String }
- **status**: String, enum: `active | locked`, default: `active`

### Dealer
- **name**: String, required
- **code**: String, required, unique
- **region**: String
- **address**: String
- **contacts**: Array<{ name: String, phone: String, email: String }>
- **contract**: ObjectId ref `DealerContract` (chưa có model tương ứng trong repo)
- **creditLimit**: Number, default: 0
- **salesTarget**: Number, default: 0
- **status**: String, enum: `active | inactive`, default: `active`

### Customer
- **fullName**: String, required
- **phone**: String (indexed)
- **email**: String (indexed)
- **idNumber**: String
- **address**: String
- **segment**: String, enum: `retail | fleet`, default: `retail`
- **notes**: String
- **ownerDealer**: ObjectId ref `Dealer`
- **ownerUser**: ObjectId ref `User`

### VehicleModel
- **name**: String, required
- **brand**: String, default: `EVM`
- **segment**: String
- **description**: String
- **active**: Boolean, default: true

### VehicleVariant
- **model**: ObjectId ref `VehicleModel`, required
- **trim**: String, required
- **battery**: String
- **range**: Number
- **motorPower**: Number
- **features**: String[]
- **msrp**: Number, required
- **images**: String[]
- **active**: Boolean, default: true
- Unique index: `{ model, trim }`

### VehicleColor
- **name**: String, required
- **code**: String
- **hex**: String
- **extraPrice**: Number, default: 0
- **active**: Boolean, default: true

### Inventory
- **ownerType**: String, required, enum: `EVM | Dealer`
- **owner**: ObjectId ref `Dealer` (tùy chọn, khi `ownerType = Dealer`)
- **variant**: ObjectId ref `VehicleVariant`, required
- **color**: ObjectId ref `VehicleColor`
- **quantity**: Number, default: 0
- **reserved**: Number, default: 0
- **vinList**: String[]
- **location**: String
- Unique index: `{ ownerType, owner, variant, color }` (sparse)

### Quote
- items là mảng `QuoteItem` (embedded, không _id)
- **dealer**: ObjectId ref `Dealer`, required
- **sales**: ObjectId ref `User`
- **customer**: ObjectId ref `Customer`, required
- **items**: Array<{
  - variant: ObjectId ref `VehicleVariant`, required
  - color: ObjectId ref `VehicleColor`
  - qty: Number, required, min: 1
  - unitPrice: Number, required
  - promotionApplied: ObjectId[] ref `Promotion`
}>
- **subtotal**: Number, default: 0
- **discount**: Number, default: 0
- **promotionTotal**: Number, default: 0
- **fees**: { registration: Number, plate: Number, delivery: Number } (mặc định 0)
- **total**: Number, default: 0
- **validUntil**: Date
- **status**: String, enum: `draft | sent | accepted | rejected`, default: `draft`
- **notes**: String

### Order
- items là mảng `OrderItem` (embedded, không _id)
- **orderNo**: String (indexed)
- **dealer**: ObjectId ref `Dealer`, required
- **sales**: ObjectId ref `User`
- **customer**: ObjectId ref `Customer`, required
- **quote**: ObjectId ref `Quote`
- **items**: Array<{
  - variant: ObjectId ref `VehicleVariant`, required
  - color: ObjectId ref `VehicleColor`
  - qty: Number, required, min: 1
  - unitPrice: Number, required
  - vins: String[]
}>
- **paymentMethod**: String, enum: `cash | finance`, default: `cash`
- **deposit**: Number, default: 0
- **status**: String, enum: `new | confirmed | allocated | invoiced | delivered | cancelled`, default: `new`
- **expectedDelivery**: Date
- **actualDelivery**: Date
- **logs**: Array<{ at: Date, by: String, action: String, note: String }>

### Payment
- **order**: ObjectId ref `Order`, required
- **type**: String, enum: `deposit | balance | finance`, required
- **amount**: Number, required
- **method**: String, enum: `cash | bank | loan`, required
- **transactionRef**: String
- **paidAt**: Date
- **status**: String, enum: `pending | confirmed | failed`, default: `pending`
- **notes**: String

### Promotion
- **name**: String, required
- **scope**: String, enum: `global | byDealer | byVariant`, default: `global`
- **dealers**: ObjectId[] ref `Dealer`
- **variants**: ObjectId[] ref `VehicleVariant`
- **type**: String, enum: `cashback | accessory | finance`, default: `cashback`
- **value**: Number, default: 0
- **stackable**: Boolean, default: false
- **validFrom**: Date, required
- **validTo**: Date, required
- **status**: String, enum: `active | inactive`, default: `active`

### SalesContract
- **order**: ObjectId ref `Order`, required
- **contractNo**: String, required, indexed
- **signedDate**: Date
- **files**: String[] (đường dẫn/URL file)
- **terms**: String
- **status**: String, enum: `draft | signed | cancelled`, default: `draft`

### TestDrive
- **customer**: ObjectId ref `Customer`, required
- **dealer**: ObjectId ref `Dealer`, required
- **variant**: ObjectId ref `VehicleVariant`, required
- **preferredTime**: Date, required
- **status**: String, enum: `requested | confirmed | done | cancelled`, default: `requested`
- **result**: { feedback: String, interestRate: Number }
- **assignedStaff**: ObjectId ref `User`

### Delivery
- **order**: ObjectId ref `Order`, required
- **address**: String
- **scheduledAt**: Date
- **status**: String, enum: `pending | in_progress | delivered`, default: `pending`
- **notes**: String

### Feedback
- **customer**: ObjectId ref `Customer`
- **dealer**: ObjectId ref `Dealer`
- **createdBy**: ObjectId ref `User`
- **content**: String, required
- **status**: String, enum: `new | in_progress | resolved`, default: `new`

---

### Gợi ý mapping FE
- ID các quan hệ dùng `string` (Mongo ObjectId) khi gửi/nhận JSON.
- Ngày giờ dùng ISO string (VD: `2025-10-31T12:00:00.000Z`).
- Các enum nên dùng select cố định theo danh sách ở trên.
- Các mảng ref (VD: `variants` trong Promotion, `items` trong Order/Quote) gửi dạng mảng ObjectId hoặc object chi tiết tùy API.




