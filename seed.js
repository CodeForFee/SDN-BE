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

    console.log("🧹 Old data cleared");

    // Seed Users
    const users = await User.insertMany([
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
    ]);

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
        manager: users[1]._id,
        staff: [users[2]._id],
      },
      {
        name: "HCM EV Dealer",
        location: "Ho Chi Minh",
        manager: users[1]._id,
        staff: [users[2]._id],
      },
    ]);

    // Seed Vehicles
    const vehicles = await Vehicle.insertMany([
      {
        brand: "VinFast",
        model: "VF8",
        year: 2024,
        price: 60000,
        features: ["Electric", "Autopilot", "AI Assistant"],
        stock: 10,
      },
      {
        brand: "Tesla",
        model: "Model 3",
        year: 2025,
        price: 55000,
        features: ["Electric", "Autopilot"],
        stock: 8,
      },
    ]);

    // Seed Orders
    const orders = await Order.insertMany([
      {
        customer: customers[0]._id,
        vehicle: vehicles[0]._id,
        dealer: dealers[0]._id,
        totalPrice: 60000,
        status: "Confirmed",
        paymentMethod: "Cash",
      },
      {
        customer: customers[1]._id,
        vehicle: vehicles[1]._id,
        dealer: dealers[1]._id,
        totalPrice: 55000,
        status: "Pending",
        paymentMethod: "Installment",
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
        validFrom: new Date(),
        validTo: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        vehicles: [vehicles[0]._id, vehicles[1]._id],
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

    console.log("✅ Seeding completed!");
    process.exit();
  } catch (err) {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  }
};

seed();
