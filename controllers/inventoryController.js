const asyncHandler = require("express-async-handler");
const Inventory = require("../model/Inventory");
const Vehicle = require("../model/Vehicle");
const Dealer = require("../model/Dealer");

const getInventory = asyncHandler(async (req, res) => {
  let filter = {};
  const userRole = req.user.role;

  if (userRole === "Dealer Manager") {
    if (req.user.dealer) {
      filter.dealer = req.user.dealer;
    } else {
      res.status(400);
      throw new Error("Dealer Manager không liên kết với đại lý nào.");
    }
  }

  const inventory = await Inventory.find(filter)
    .populate("Vehicle", "name model")
    .populate("Dealer", "name address");

  res.status(200).json(inventory);
});

const createInventory = asyncHandler(async (req, res) => {
  const { vehicle, dealer, quantity } = req.body;

  if (!vehicle || !dealer || quantity === undefined) {
    res.status(400);
    throw new Error(
      "Vui lòng nhập đầy đủ các trường: vehicle, dealer, quantity."
    );
  }

  const vehicleExists = await Vehicle.findById(vehicle);
  const dealerExists = await Dealer.findById(dealer);

  if (!vehicleExists) {
    res.status(404);
    throw new Error("ID xe (Vehicle) không hợp lệ hoặc không tồn tại.");
  }

  if (!dealerExists) {
    res.status(404);
    throw new Error("ID đại lý (Dealer) không hợp lệ hoặc không tồn tại.");
  }

  const existingInventory = await Inventory.findOne({ vehicle, dealer });

  if (existingInventory) {
    res.status(400);
    throw new Error(
      "Mục tồn kho cho xe này tại đại lý này đã tồn tại. Hãy sử dụng PUT để cập nhật."
    );
  }

  const newInventory = await Inventory.create({
    vehicle,
    dealer,
    quantity,
  });

  res.status(201).json(newInventory);
});

const updateInventory = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const { id } = req.params;

  if (quantity === undefined) {
    res.status(400);
    throw new Error("Vui lòng cung cấp 'quantity' để cập nhật.");
  }

  const inventoryItem = await Inventory.findById(id);

  if (!inventoryItem) {
    res.status(404);
    throw new Error(`Không tìm thấy mục tồn kho với ID: ${id}`);
  }

  const updatedInventory = await Inventory.findByIdAndUpdate(
    id,
    { quantity },
    { new: true, runValidators: true }
  )
    .populate("Vehicle")
    .populate("Dealer");

  res.status(200).json(updatedInventory);
});

const deleteInventory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const inventoryItem = await Inventory.findByIdAndDelete(id);

  if (!inventoryItem) {
    res.status(404);
    throw new Error(`Không tìm thấy mục tồn kho với ID: ${id}`);
  }

  res.status(200).json({
    message: "Mục tồn kho đã được xóa thành công.",
    id: id,
  });
});

module.exports = {
  getInventory,
  createInventory,
  updateInventory,
  deleteInventory,
};
