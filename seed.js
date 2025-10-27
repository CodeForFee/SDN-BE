const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

dotenv.config();

const User = require("./models/User");
const Customer = require("./models/Customer");
const Dealer = require("./models/Dealer");
const Order = require("./models/Order");
const Inventory = require("./models/Inventory");
const Promotion = require("./models/Promotion");
const Quote = require("./models/Quote");
const VehicleModel = require("./models/VehicleModel");
const VehicleVariant = require("./models/VehicleVariant");
const VehicleColor = require("./models/VehicleColor");
const DealerContract = require("./models/DealerContract");
const DealerTarget = require("./models/DealerTarget");
const Complaint = require("./models/Complaint");
const Allocation = require("./models/Allocation");
const Payment = require("./models/Payment");
const TestDrive = require("./models/TestDrive");
const PricePolicy = require("./models/PricePolicy");
const SalesContract = require("./models/SalesContract");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected for seeding"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const seed = async () => {
  try {
    // Clear old data
    await User.deleteMany();
    await Customer.deleteMany();
    await Dealer.deleteMany();
    await Order.deleteMany();
    await Inventory.deleteMany();
    await Promotion.deleteMany();
    await Quote.deleteMany();
    await VehicleModel.deleteMany();
    await VehicleVariant.deleteMany();
    await VehicleColor.deleteMany();
    await DealerContract.deleteMany();
    await DealerTarget.deleteMany();
    await Complaint.deleteMany();
    await Allocation.deleteMany();
    await Payment.deleteMany();
    await TestDrive.deleteMany();
    await PricePolicy.deleteMany();
    await SalesContract.deleteMany();

    console.log("🧹 Old data cleared");

    // Seed Dealers first (needed for User creation)
    const dealers = await Dealer.insertMany([
      {
        name: "Hanoi EV Dealer",
        code: "HAN001",
        region: "North",
        address: "123 Cau Giay, Hanoi",
        contacts: [
          { name: "Manager", phone: "0901234567", email: "hanoi@evdealer.com" }
        ],
        creditLimit: 1000000000,
        status: "active",
      },
      {
        name: "HCM EV Dealer", 
        code: "HCM001",
        region: "South",
        address: "456 Nguyen Hue, Ho Chi Minh",
        contacts: [
          { name: "Manager", phone: "0902345678", email: "hcm@evdealer.com" }
        ],
        creditLimit: 1500000000,
        status: "active",
      },
      {
        name: "Da Nang EV Dealer",
        code: "DN001",
        region: "Central",
        address: "789 Le Loi, Da Nang", 
        contacts: [
          { name: "Manager", phone: "0903456789", email: "danang@evdealer.com" }
        ],
        creditLimit: 800000000,
        status: "active",
      },
    ]);

    // Seed Users with dealer associations
    const passwordHash = await bcrypt.hash("123456", 10);
    const userData = [
      {
        email: "admin@evms.com",
        passwordHash,
        role: "Admin",
        profile: { name: "System Admin" },
      },
      {
        email: "evm.staff@evms.com", 
        passwordHash,
        role: "EVMStaff",
        profile: { name: "EVM Staff Manager" },
      },
      {
        email: "hanoi.manager@evdealer.com",
        passwordHash, 
        role: "DealerManager",
        dealer: dealers[0]._id,
        profile: { name: "Hanoi Dealer Manager" },
      },
      {
        email: "hanoi.staff1@evdealer.com",
        passwordHash,
        role: "DealerStaff", 
        dealer: dealers[0]._id,
        profile: { name: "Hanoi Dealer Staff 1" },
      },
      {
        email: "hcm.manager@evdealer.com",
        passwordHash,
        role: "DealerManager",
        dealer: dealers[1]._id,
        profile: { name: "HCM Dealer Manager" },
      },
      {
        email: "danang.manager@evdealer.com",
        passwordHash,
        role: "DealerManager", 
        dealer: dealers[2]._id,
        profile: { name: "Da Nang Dealer Manager" },
      },
    ];

    const users = await User.insertMany(userData);

    // Seed Customers
    const customers = await Customer.insertMany([
      { fullName: "Nguyen Van A", email: "nguyenvana@gmail.com", phone: "0901234567", address: "Hanoi", notes: "Very interested in VF8 model" },
      { fullName: "Tran Thi B", email: "tranthib@gmail.com", phone: "0902345678", address: "Ho Chi Minh", notes: "Looking for family car" },
      { fullName: "Le Van C", email: "levanc@gmail.com", phone: "0903456789", address: "Da Nang", notes: "Budget around 5 billion VND" },
      { fullName: "Pham Thi D", email: "phamthid@gmail.com", phone: "0904567890", address: "Hanoi", notes: "Prefer installment payment" },
      { fullName: "Hoang Van E", email: "hoangvane@gmail.com", phone: "0905678901", address: "Ho Chi Minh", notes: "Need delivery by next month" },
    ]);

    // Seed Vehicle Models
    const vehicleModels = await VehicleModel.insertMany([
      {
        name: "VF6",
        brand: "EVM",
        segment: "Compact",
        description: "Urban electric vehicle perfect for city driving",
        active: true,
      },
      {
        name: "VF8",
        brand: "EVM",
        segment: "Mid-size",
        description: "Premium electric SUV with advanced features",
        active: true,
      },
      {
        name: "VF9",
        brand: "EVM",
        segment: "Full-size",
        description: "Luxury 7-seater electric SUV",
        active: true,
      },
    ]);

    // Seed Vehicle Colors
    const vehicleColors = await VehicleColor.insertMany([
      { name: "Pearl White", code: "PW", hex: "#FFFFFF", extraPrice: 0, active: true },
      { name: "Midnight Black", code: "MB", hex: "#000000", extraPrice: 0, active: true },
      { name: "Silver Metallic", code: "SM", hex: "#C0C0C0", extraPrice: 5000000, active: true },
      { name: "Ocean Blue", code: "OB", hex: "#0066CC", extraPrice: 3000000, active: true },
    ]);

    // Seed Vehicle Variants
    const vehicleVariants = await VehicleVariant.insertMany([
      {
        model: vehicleModels[0]._id, // VF6
        trim: "Standard",
        battery: "60kWh",
        range: 400,
        motorPower: 150,
        features: ["Electric", "Compact Design", "City Driving", "Basic Autopilot"],
        msrp: 4500000000,
        images: ["vf6_standard_1.jpg"],
        active: true,
      },
      {
        model: vehicleModels[1]._id, // VF8
        trim: "Standard",
        battery: "90kWh",
        range: 550,
        motorPower: 250,
        features: ["Electric", "Autopilot", "AI Assistant", "Fast Charging"],
        msrp: 6000000000,
        images: ["vf8_standard_1.jpg"],
        active: true,
      },
      {
        model: vehicleModels[1]._id, // VF8
        trim: "Premium",
        battery: "100kWh",
        range: 600,
        motorPower: 300,
        features: ["Electric", "Autopilot", "AI Assistant", "Fast Charging", "Premium Interior"],
        msrp: 6500000000,
        images: ["vf8_premium_1.jpg"],
        active: true,
      },
      {
        model: vehicleModels[2]._id, // VF9
        trim: "Luxury",
        battery: "120kWh",
        range: 650,
        motorPower: 400,
        features: ["Electric", "Autopilot", "AI Assistant", "Fast Charging", "7 Seats", "Premium Audio"],
        msrp: 8000000000,
        images: ["vf9_luxury_1.jpg"],
        active: true,
      },
    ]);

    // Seed Orders
    const orders = await Order.insertMany([
      {
        orderNo: "ORD-2024-001",
        dealer: dealers[0]._id,
        customer: customers[0]._id,
        items: [{
          variant: vehicleVariants[1]._id, // VF8 Standard
          color: vehicleColors[0]._id,
          qty: 1,
          unitPrice: 6000000000,
        }],
        paymentMethod: "cash",
        status: "confirmed",
        expectedDelivery: new Date(new Date().setDate(new Date().getDate() + 30)),
      },
      {
        orderNo: "ORD-2024-002",
        dealer: dealers[1]._id,
        customer: customers[1]._id,
        items: [{
          variant: vehicleVariants[2]._id, // VF8 Premium
          color: vehicleColors[1]._id,
          qty: 1,
          unitPrice: 6500000000,
        }],
        paymentMethod: "finance",
        deposit: 1950000000,
        status: "new",
        expectedDelivery: new Date(new Date().setDate(new Date().getDate() + 45)),
      },
    ]);

    // Seed Inventory
    await Inventory.insertMany([
      { ownerType: "Dealer", owner: dealers[0]._id, variant: vehicleVariants[1]._id, color: vehicleColors[0]._id, quantity: 8 },
      { ownerType: "Dealer", owner: dealers[1]._id, variant: vehicleVariants[2]._id, color: vehicleColors[1]._id, quantity: 6 },
      { ownerType: "Dealer", owner: dealers[2]._id, variant: vehicleVariants[0]._id, color: vehicleColors[2]._id, quantity: 5 },
    ]);

    // Seed Promotions
    const promotions = await Promotion.insertMany([
      {
        name: "New Year Discount",
        scope: "byDealer",
        dealers: [dealers[0]._id],
        type: "cashback",
        value: 10,
        validFrom: new Date(),
        validTo: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        status: "active",
      },
      {
        name: "Summer Sale",
        scope: "byDealer",
        dealers: [dealers[1]._id],
        type: "cashback",
        value: 15,
        validFrom: new Date(),
        validTo: new Date(new Date().setDate(new Date().getDate() + 30)),
        status: "active",
      },
    ]);

    // Seed Quotes
    await Quote.insertMany([
      {
        customer: customers[0]._id,
        dealer: dealers[0]._id,
        items: [{
          variant: vehicleVariants[1]._id,
          color: vehicleColors[0]._id,
          qty: 1,
          unitPrice: 6000000000,
        }],
        subtotal: 6000000000,
        discount: 600000000,
        total: 5400000000,
        validUntil: new Date(new Date().setDate(new Date().getDate() + 7)),
        status: "sent",
        notes: "Special discount for loyal customer",
      },
    ]);

    // Seed Dealer Contracts
    const dealerContracts = await DealerContract.insertMany([
      {
        dealer: dealers[0]._id,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2026-12-31'),
        targets: "Annual target: 100 units",
        discountPolicyRef: "POL-2024-001",
        status: 'active',
      },
      {
        dealer: dealers[1]._id,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2026-12-31'),
        targets: "Annual target: 150 units",
        discountPolicyRef: "POL-2024-002",
        status: 'active',
      },
    ]);

    // Seed Dealer Targets
    const dealerTargets = [];
    const months = ['01', '02', '03', '04', '05', '06'];
    
    for (const dealer of dealers) {
      for (const month of months) {
        const period = `2024-${month}`;
        const baseUnits = dealer.name.includes('HCM') ? 12 : 8;
        const baseRevenue = baseUnits * 6000000000;
        
        dealerTargets.push({
          dealer: dealer._id,
          period,
          targetUnits: baseUnits,
          achievedUnits: Math.floor(baseUnits * 0.8),
          targetRevenue: baseRevenue,
          achievedRevenue: Math.floor(baseRevenue * 0.8),
          status: 'on_track',
        });
      }
    }
    await DealerTarget.insertMany(dealerTargets);

    // Seed Price Policies
    const pricePolicies = await PricePolicy.insertMany([
      {
        variant: vehicleVariants[1]._id,
        baseWholesalePrice: 5500000000,
        discountType: "fixed",
        discountValue: 0,
        validFrom: new Date('2024-01-01'),
        validTo: new Date('2024-12-31'),
        status: "active",
      },
      {
        variant: vehicleVariants[2]._id,
        baseWholesalePrice: 6000000000,
        discountType: "fixed",
        discountValue: 0,
        validFrom: new Date('2024-01-01'),
        validTo: new Date('2024-12-31'),
        status: "active",
      },
    ]);

    // Seed Test Drives
    const testDrives = await TestDrive.insertMany([
      {
        customer: customers[0]._id,
        dealer: dealers[0]._id,
        variant: vehicleVariants[1]._id,
        preferredTime: new Date(new Date().setHours(new Date().getHours() + 2)),
        status: "confirmed",
        assignedStaff: users[2]._id,
      },
      {
        customer: customers[1]._id,
        dealer: dealers[1]._id,
        variant: vehicleVariants[2]._id,
        preferredTime: new Date(new Date().setHours(new Date().getHours() - 2)),
        status: "done",
        result: { feedback: "Excellent car", interestRate: 95 },
      },
    ]);

    // Seed Payments
    const payments = [];
    for (const order of orders) {
      if (order.paymentMethod === 'cash') {
        payments.push({
          order: order._id,
          type: 'balance',
          amount: order.items[0].unitPrice,
          method: 'cash',
          transactionRef: `CASH-${order.orderNo}`,
          paidAt: new Date(),
          status: 'confirmed',
          notes: 'Full payment in cash',
        });
      } else {
        payments.push({
          order: order._id,
          type: 'deposit',
          amount: order.deposit,
          method: 'bank',
          transactionRef: `DEP-${order.orderNo}`,
          paidAt: new Date(),
          status: 'confirmed',
          notes: '30% deposit payment',
        });
      }
    }
    await Payment.insertMany(payments);

    // Seed Complaints
    const complaints = await Complaint.insertMany([
      {
        customer: customers[0]._id,
        dealer: dealers[0]._id,
        order: orders[0]._id,
        type: 'delivery',
        content: 'Vehicle delivery was delayed',
        status: 'resolved',
        resolution: 'Compensated with free maintenance',
      },
    ]);

    // Seed Allocations
    const allocations = await Allocation.insertMany([
      {
        fromOwner: 'EVM',
        toDealer: dealers[0]._id,
        variant: vehicleVariants[1]._id,
        color: vehicleColors[0]._id,
        quantity: 10,
        requestedBy: users[2]._id,
        approvedBy: users[1]._id,
        status: 'received',
        expectedDate: new Date(),
      },
    ]);

    // Seed Sales Contracts
    const salesContracts = await SalesContract.insertMany([
      {
        order: orders[0]._id,
        contractNo: 'SC-2024-001',
        signedDate: new Date(),
        terms: 'Standard EVM sales contract with 3-year warranty',
        status: 'signed',
      },
    ]);

    console.log("✅ Seeding completed!");
    console.log(`📊 Data Summary:`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Dealers: ${dealers.length}`);
    console.log(`   - Customers: ${customers.length}`);
    console.log(`   - Vehicle Models: ${vehicleModels.length}`);
    console.log(`   - Vehicle Variants: ${vehicleVariants.length}`);
    console.log(`   - Vehicle Colors: ${vehicleColors.length}`);
    console.log(`   - Orders: ${orders.length}`);
    console.log(`   - Inventory items: 3`);
    console.log(`   - Promotions: ${promotions.length}`);
    console.log(`   - Quotes: 1`);
    console.log(`   - Test Drives: ${testDrives.length}`);
    console.log(`   - Payments: ${payments.length}`);
    console.log(`   - Complaints: ${complaints.length}`);
    console.log(`   - Allocations: ${allocations.length}`);
    console.log(`   - Sales Contracts: ${salesContracts.length}`);
    console.log(`   - Dealer Contracts: ${dealerContracts.length}`);
    console.log(`   - Dealer Targets: ${dealerTargets.length}`);
    console.log(`   - Price Policies: ${pricePolicies.length}`);
    console.log(`\n🔑 Test Accounts:`);
    console.log(`   Admin: admin@evms.com / 123456`);
    console.log(`   EVM Staff: evm.staff@evms.com / 123456`);
    console.log(`   Hanoi Manager: hanoi.manager@evdealer.com / 123456`);
    console.log(`   Hanoi Staff: hanoi.staff1@evdealer.com / 123456`);
    console.log(`   HCM Manager: hcm.manager@evdealer.com / 123456`);
    console.log(`   Da Nang Manager: danang.manager@evdealer.com / 123456`);
    
    process.exit();
  } catch (err) {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  }
};

seed();
