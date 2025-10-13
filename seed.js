const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const User = require("./model/User");
const Customer = require("./model/Customer");
const Dealer = require("./model/Dealer");
const Vehicle = require("./model/Vehicle");
const Order = require("./model/Order");
const Inventory = require("./model/Inventory");
const Promotion = require("./model/Promotion");
const Booking = require("./model/Booking");
const Quote = require("./model/Quote");

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
    await Vehicle.deleteMany();
    await Order.deleteMany();
    await Inventory.deleteMany();
    await Promotion.deleteMany();
    await Booking.deleteMany();
    await Quote.deleteMany();

    console.log("🧹 Old data cleared");

    // Seed Dealers first (needed for User creation)
    const dealers = await Dealer.insertMany([
      {
        name: "Hanoi EV Dealer",
        location: "Hanoi",
        contactInfo: "hanoi@evdealer.com",
        salesTarget: 100,
        debt: 500000000,
      },
      {
        name: "HCM EV Dealer", 
        location: "Ho Chi Minh",
        contactInfo: "hcm@evdealer.com",
        salesTarget: 150,
        debt: 750000000,
      },
      {
        name: "Da Nang EV Dealer",
        location: "Da Nang", 
        contactInfo: "danang@evdealer.com",
        salesTarget: 80,
        debt: 300000000,
      },
    ]);

    // Seed Users with dealer associations
    const userData = [
      {
        name: "System Admin",
        email: "admin@evms.com",
        password: "123456",
        role: "Admin",
      },
      {
        name: "EVM Staff Manager",
        email: "evm.staff@evms.com", 
        password: "123456",
        role: "EVM Staff",
      },
      {
        name: "Hanoi Dealer Manager",
        email: "hanoi.manager@evdealer.com",
        password: "123456", 
        role: "Dealer Manager",
        dealer: dealers[0]._id,
      },
      {
        name: "Hanoi Dealer Staff 1",
        email: "hanoi.staff1@evdealer.com",
        password: "123456",
        role: "Dealer Staff", 
        dealer: dealers[0]._id,
      },
      {
        name: "Hanoi Dealer Staff 2",
        email: "hanoi.staff2@evdealer.com",
        password: "123456",
        role: "Dealer Staff",
        dealer: dealers[0]._id,
      },
      {
        name: "HCM Dealer Manager", 
        email: "hcm.manager@evdealer.com",
        password: "123456",
        role: "Dealer Manager",
        dealer: dealers[1]._id,
      },
      {
        name: "HCM Dealer Staff",
        email: "hcm.staff@evdealer.com", 
        password: "123456",
        role: "Dealer Staff",
        dealer: dealers[1]._id,
      },
      {
        name: "Da Nang Dealer Manager",
        email: "danang.manager@evdealer.com",
        password: "123456",
        role: "Dealer Manager", 
        dealer: dealers[2]._id,
      },
    ];

    const users = [];
    for (const user of userData) {
      const newUser = new User(user);
      await newUser.save();
      users.push(newUser);
    }

    // Seed Customers
    const customers = await Customer.insertMany([
      { name: "Nguyen Van A", email: "nguyenvana@gmail.com", phone: "0901234567", address: "Hanoi", feedback: "Very interested in VF8 model" },
      { name: "Tran Thi B", email: "tranthib@gmail.com", phone: "0902345678", address: "Ho Chi Minh", feedback: "Looking for family car" },
      { name: "Le Van C", email: "levanc@gmail.com", phone: "0903456789", address: "Da Nang", feedback: "Budget around 5 billion VND" },
      { name: "Pham Thi D", email: "phamthid@gmail.com", phone: "0904567890", address: "Hanoi", feedback: "Prefer installment payment" },
      { name: "Hoang Van E", email: "hoangvane@gmail.com", phone: "0905678901", address: "Ho Chi Minh", feedback: "Need delivery by next month" },
      { name: "Vu Thi F", email: "vuthif@gmail.com", phone: "0906789012", address: "Can Tho", feedback: "First time buying electric car" },
    ]);

    // Seed Vehicles
    const vehicles = await Vehicle.insertMany([
      {
        model: "VF8",
        version: "Standard",
        color: "White",
        price: 6000000000,
        features: ["Electric", "Autopilot", "AI Assistant", "Fast Charging"],
      },
      {
        model: "VF8", 
        version: "Premium",
        color: "Black",
        price: 6500000000,
        features: ["Electric", "Autopilot", "AI Assistant", "Fast Charging", "Premium Interior"],
      },
      {
        model: "VF9",
        version: "Luxury",
        color: "Silver",
        price: 8000000000,
        features: ["Electric", "Autopilot", "AI Assistant", "Fast Charging", "7 Seats", "Premium Audio"],
      },
      {
        model: "VF6",
        version: "Compact",
        color: "Blue",
        price: 4500000000,
        features: ["Electric", "Compact Design", "City Driving"],
      },
      {
        model: "VF7",
        version: "Sport",
        color: "Red",
        price: 5500000000,
        features: ["Electric", "Sport Mode", "High Performance"],
      },
    ]);

    // Seed Orders
    const orders = await Order.insertMany([
      {
        customer: customers[0]._id,
        vehicle: vehicles[0]._id,
        dealer: dealers[0]._id,
        status: "Confirmed",
        paymentType: "Cash",
        amount: 6000000000,
      },
      {
        customer: customers[1]._id,
        vehicle: vehicles[1]._id,
        dealer: dealers[1]._id,
        status: "Pending",
        paymentType: "Installment",
        amount: 6500000000,
      },
      {
        customer: customers[2]._id,
        vehicle: vehicles[3]._id,
        dealer: dealers[2]._id,
        status: "Delivered",
        paymentType: "Cash",
        amount: 4500000000,
      },
      {
        customer: customers[3]._id,
        vehicle: vehicles[2]._id,
        dealer: dealers[0]._id,
        status: "Confirmed",
        paymentType: "Installment",
        amount: 8000000000,
      },
      {
        customer: customers[4]._id,
        vehicle: vehicles[4]._id,
        dealer: dealers[1]._id,
        status: "Pending",
        paymentType: "Cash",
        amount: 5500000000,
      },
    ]);

    // Seed Inventory
    await Inventory.insertMany([
      { dealer: dealers[0]._id, vehicle: vehicles[0]._id, quantity: 8 },
      { dealer: dealers[0]._id, vehicle: vehicles[1]._id, quantity: 5 },
      { dealer: dealers[0]._id, vehicle: vehicles[2]._id, quantity: 3 },
      { dealer: dealers[1]._id, vehicle: vehicles[1]._id, quantity: 6 },
      { dealer: dealers[1]._id, vehicle: vehicles[3]._id, quantity: 10 },
      { dealer: dealers[1]._id, vehicle: vehicles[4]._id, quantity: 4 },
      { dealer: dealers[2]._id, vehicle: vehicles[3]._id, quantity: 7 },
      { dealer: dealers[2]._id, vehicle: vehicles[4]._id, quantity: 2 },
    ]);

    // Seed Promotions
    const promotions = await Promotion.insertMany([
      {
        title: "New Year Discount",
        description: "10% off for all vehicles",
        discountPercent: 10,
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        dealer: dealers[0]._id,
      },
      {
        title: "Summer Sale",
        description: "15% off on VF8 models",
        discountPercent: 15,
        startDate: new Date(),
        endDate: new Date(new Date().setDate(new Date().getDate() + 30)),
        dealer: dealers[1]._id,
      },
      {
        title: "Family Package",
        description: "Special price for VF9 7-seater",
        discountPercent: 8,
        startDate: new Date(),
        endDate: new Date(new Date().setDate(new Date().getDate() + 45)),
        dealer: dealers[2]._id,
      },
    ]);

    // Seed Bookings
    await Booking.insertMany([
      {
        customer: customers[0]._id,
        vehicle: vehicles[0]._id,
        testDriveDate: new Date(new Date().setHours(new Date().getHours() + 2)),
        status: "Scheduled",
      },
      {
        customer: customers[1]._id,
        vehicle: vehicles[1]._id,
        testDriveDate: new Date(new Date().setHours(new Date().getHours() - 2)),
        status: "Completed",
      },
      {
        customer: customers[2]._id,
        vehicle: vehicles[2]._id,
        testDriveDate: new Date(new Date().setDate(new Date().getDate() + 1)),
        status: "Scheduled",
      },
      {
        customer: customers[3]._id,
        vehicle: vehicles[3]._id,
        testDriveDate: new Date(new Date().setHours(new Date().getHours() - 4)),
        status: "Cancelled",
      },
      {
        customer: customers[4]._id,
        vehicle: vehicles[4]._id,
        testDriveDate: new Date(new Date().setDate(new Date().getDate() + 2)),
        status: "Scheduled",
      },
    ]);

    // Seed Quotes
    await Quote.insertMany([
      {
        customer: customers[0]._id,
        dealer: dealers[0]._id,
        vehicle: vehicles[0]._id,
        quotedPrice: 5400000000, // 10% discount
        validUntil: new Date(new Date().setDate(new Date().getDate() + 7)),
        status: "Active",
        notes: "Special discount for loyal customer",
      },
      {
        customer: customers[1]._id,
        dealer: dealers[1]._id,
        vehicle: vehicles[1]._id,
        quotedPrice: 5525000000, // 15% discount
        validUntil: new Date(new Date().setDate(new Date().getDate() + 5)),
        status: "Accepted",
        notes: "Installment payment option available",
      },
      {
        customer: customers[2]._id,
        dealer: dealers[2]._id,
        vehicle: vehicles[3]._id,
        quotedPrice: 4500000000,
        validUntil: new Date(new Date().setDate(new Date().getDate() + 10)),
        status: "Active",
        notes: "Standard pricing for compact model",
      },
      {
        customer: customers[3]._id,
        dealer: dealers[0]._id,
        vehicle: vehicles[2]._id,
        quotedPrice: 7360000000, // 8% discount
        validUntil: new Date(new Date().setDate(new Date().getDate() + 14)),
        status: "Expired",
        notes: "Family package promotion",
      },
      {
        customer: customers[4]._id,
        dealer: dealers[1]._id,
        vehicle: vehicles[4]._id,
        quotedPrice: 5500000000,
        validUntil: new Date(new Date().setDate(new Date().getDate() + 3)),
        status: "Rejected",
        notes: "Customer found better offer elsewhere",
      },
    ]);

    console.log("✅ Seeding completed!");
    console.log(`📊 Data Summary:`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Dealers: ${dealers.length}`);
    console.log(`   - Customers: ${customers.length}`);
    console.log(`   - Vehicles: ${vehicles.length}`);
    console.log(`   - Orders: ${orders.length}`);
    console.log(`   - Inventory items: 8`);
    console.log(`   - Promotions: ${promotions.length}`);
    console.log(`   - Bookings: 5`);
    console.log(`   - Quotes: 5`);
    console.log(`\n🔑 Test Accounts:`);
    console.log(`   Admin: admin@evms.com / 123456`);
    console.log(`   EVM Staff: evm.staff@evms.com / 123456`);
    console.log(`   Hanoi Manager: hanoi.manager@evdealer.com / 123456`);
    console.log(`   Hanoi Staff: hanoi.staff1@evdealer.com / 123456`);
    console.log(`   HCM Manager: hcm.manager@evdealer.com / 123456`);
    console.log(`   HCM Staff: hcm.staff@evdealer.com / 123456`);
    console.log(`   Da Nang Manager: danang.manager@evdealer.com / 123456`);
    
    process.exit();
  } catch (err) {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  }
};

seed();
