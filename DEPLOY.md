# Deploy to Render

## Prerequisites
1. GitHub repository với code
2. Render account (free tier available)

## Deployment Steps

### 1. Prepare Environment Variables
Tạo file `.env` với các biến môi trường sau:
```env
MONGO_URI=mongodb://localhost:27017/sdn_db
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_here
```

### 2. Deploy to Render

#### Option 1: Using render.yaml (Recommended)
1. Push code lên GitHub repository
2. Vào Render dashboard
3. Chọn "New" → "Blueprint"
4. Connect GitHub repository
5. Render sẽ tự động detect `render.yaml` và deploy

#### Option 2: Manual Setup
1. Vào Render dashboard
2. Chọn "New" → "Web Service"
3. Connect GitHub repository
4. Cấu hình:
   - **Name**: `sdn-be`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/health`

### 3. Database Setup
1. Tạo MongoDB database trên Render:
   - Chọn "New" → "MongoDB"
   - Name: `sdn-mongodb`
   - Plan: Free
2. Copy connection string và set làm `MONGO_URI` environment variable

### 4. Environment Variables trên Render
Set các biến môi trường sau:
- `NODE_ENV`: `production`
- `MONGO_URI`: (từ Render MongoDB)
- `JWT_SECRET`: (generate secure random string)

### 5. Seed Database (Optional)
Sau khi deploy, có thể chạy seed để tạo dữ liệu mẫu:
```bash
# SSH vào Render service hoặc chạy local với production DB
npm run seed
```

## API Endpoints

### Production URLs
- **API Base**: `https://sdn-be.onrender.com/api`
- **Documentation**: `https://sdn-be.onrender.com/api-docs`
- **Health Check**: `https://sdn-be.onrender.com/health`

### Test Accounts (sau khi seed)
```
Admin: admin@evms.com / 123456
EVM Staff: evm.staff@evms.com / 123456
Hanoi Manager: hanoi.manager@evdealer.com / 123456
Hanoi Staff: hanoi.staff1@evdealer.com / 123456
HCM Manager: hcm.manager@evdealer.com / 123456
HCM Staff: hcm.staff@evdealer.com / 123456
Da Nang Manager: danang.manager@evdealer.com / 123456
```

## Monitoring
- Render dashboard cung cấp logs và metrics
- Health check endpoint: `/health`
- Auto-deploy khi push code lên main branch

## Troubleshooting
1. **Build fails**: Check logs trong Render dashboard
2. **Database connection fails**: Verify `MONGO_URI` environment variable
3. **App crashes**: Check logs và error messages
4. **Slow startup**: Normal cho free tier, có thể mất 30-60 giây để wake up
