const asyncHandler = require("express-async-handler");
const Inventory = require("../models/Inventory");
const VehicleVariant = require("../models/VehicleVariant");
const Dealer = require("../models/Dealer");

const getInventory = asyncHandler(async (req, res) => {
  let filter = {};
  const userRole = req.user.role;

  if (userRole === "Dealer Manager") {
    if (req.user.dealer) {
      filter.owner = req.user.dealer;
      filter.ownerType = "Dealer";
    } else {
      res.status(400);
      throw new Error("Dealer Manager không liên kết với đại lý nào.");
    }
  }

  const inventory = await Inventory.find(filter)
    .populate("variant", "trim msrp")
    .populate("color", "name code")
    .populate("owner", "name address");

  res.status(200).json(inventory);
});

const createInventory = asyncHandler(async (req, res) => {
  const { variant, color, owner, ownerType, quantity } = req.body;

  if (!variant || !owner || !ownerType || quantity === undefined) {
    res.status(400);
    throw new Error(
      "Vui lòng nhập đầy đủ các trường: variant, owner, ownerType, quantity."
    );
  }

  const variantExists = await VehicleVariant.findById(variant);
  const dealerExists = await Dealer.findById(owner);

  if (!variantExists) {
    res.status(404);
    throw new Error("ID variant không hợp lệ hoặc không tồn tại.");
  }

  if (!dealerExists) {
    res.status(404);
    throw new Error("ID đại lý không hợp lệ hoặc không tồn tại.");
  }

  const existingInventory = await Inventory.findOne({ variant, color, owner, ownerType });

  if (existingInventory) {
    res.status(400);
    throw new Error(
      "Mục tồn kho cho xe này tại đại lý này đã tồn tại. Hãy sử dụng PUT để cập nhật."
    );
  }

  const newInventory = await Inventory.create({
    variant,
    color,
    owner,
    ownerType,
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
    .populate("variant", "trim msrp")
    .populate("color", "name code")
    .populate("owner", "name address");

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
