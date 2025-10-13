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

    // Seed Users
    const userData = [
      {
        name: "System Admin",
        email: "admin@evms.com",
        password: "123456",
        role: "Admin",
      },
      {
        name: "Dealer Manager",
        email: "dealer.manager@evms.com",
        password: "123456",
        role: "DealerManager",
      },
      {
        name: "Dealer Staff",
        email: "dealer.staff@evms.com",
        password: "123456",
        role: "DealerStaff",
      },
      {
        name: "EVM Staff",
        email: "evm.staff@evms.com",
        password: "123456",
        role: "EVMStaff",
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
      { name: "Nguyen Van A", email: "a@gmail.com", phone: "0901234567", address: "Hanoi" },
      { name: "Tran Thi B", email: "b@gmail.com", phone: "0902345678", address: "HCM" },
    ]);

    // Seed Dealers
    const dealers = await Dealer.insertMany([
      {
        name: "Hanoi EV Dealer",
        location: "Hanoi",
        contactInfo: "hanoi@evdealer.com",
        salesTarget: 100,
        debt: 0,
      },
      {
        name: "HCM EV Dealer",
        location: "Ho Chi Minh",
        contactInfo: "hcm@evdealer.com",
        salesTarget: 150,
        debt: 0,
      },
    ]);

    // Seed Vehicles
    const vehicles = await Vehicle.insertMany([
      {
        model: "VF8",
        version: "Standard",
        color: "White",
        price: 6000000000,
        features: ["Electric", "Autopilot", "AI Assistant"],
      },
      {
        model: "Model 3",
        version: "Performance",
        color: "Black",
        price: 5500000000,
        features: ["Electric", "Autopilot"],
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
        amount: 5500000000,
      },
    ]);

    // Seed Inventory
    await Inventory.insertMany([
      { dealer: dealers[0]._id, vehicle: vehicles[0]._id, quantity: 5 },
      { dealer: dealers[1]._id, vehicle: vehicles[1]._id, quantity: 3 },
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
    ]);

    // Seed Bookings
    await Booking.insertMany([
      {
        customer: customers[0]._id,
        vehicle: vehicles[0]._id,
        testDriveDate: new Date(),
        status: "Scheduled",
      },
      {
        customer: customers[1]._id,
        vehicle: vehicles[1]._id,
        testDriveDate: new Date(),
        status: "Completed",
      },
    ]);

    // Seed Quotes
    await Quote.insertMany([
      {
        customer: customers[0]._id,
        dealer: dealers[0]._id,
        vehicle: vehicles[0]._id,
        quotedPrice: 6000000000,
        validUntil: new Date(new Date().setDate(new Date().getDate() + 7)),
        status: "Active",
        notes: "Special discount for loyal customer",
      },
      {
        customer: customers[1]._id,
        dealer: dealers[1]._id,
        vehicle: vehicles[1]._id,
        quotedPrice: 5500000000,
        validUntil: new Date(new Date().setDate(new Date().getDate() + 5)),
        status: "Accepted",
        notes: "Installment payment option",
      },
    ]);

    console.log("✅ Seeding completed!");
    process.exit();
  } catch (err) {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  }
};

seed();
