const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./model/User");
const Dealer = require("./model/Dealer");
const Vehicle = require("./model/Vehicle");
const Customer = require("./model/Customer");

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected (seeding)");

    // Xóa data cũ
    await User.deleteMany();
    await Dealer.deleteMany();
    await Vehicle.deleteMany();
    await Customer.deleteMany();

    // Tạo 1 admin
    const admin = await User.create({
      name: "System Admin",
      email: "admin@example.com",
      password: "123456",
      role: "Admin"
    });

    // Tạo 1 dealer
    const dealer = await Dealer.create({
      name: "Hanoi EV Dealer",
      location: "Hà Nội",
      contactInfo: "0123456789",
      salesTarget: 100
    });

    // Tạo vài vehicle
    const vehicles = await Vehicle.insertMany([
      { model: "EV A1", version: "Standard", color: "Red", price: 25000, features: ["ABS", "Bluetooth"] },
      { model: "EV B2", version: "Premium", color: "Blue", price: 32000, features: ["GPS", "Heated Seats"] }
    ]);

    // Tạo 1 customer
    const customer = await Customer.create({
      name: "Nguyen Van A",
      phone: "0909999999",
      email: "vana@gmail.com",
      address: "Hà Nội"
    });

    console.log("🌱 Seed completed");
    console.log({ admin, dealer, vehicles, customer });
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
