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
  const { variant, color, owner, ownerType, quantity, location } = req.body;

  // Validate required fields
  if (!variant || !ownerType || quantity === undefined) {
    res.status(400);
    throw new Error(
      "Vui lòng nhập đầy đủ các trường: variant, ownerType, quantity."
    );
  }

  // If ownerType is 'Dealer', owner is required
  if (ownerType === 'Dealer' && !owner) {
    res.status(400);
    throw new Error(
      "Vui lòng chọn đại lý khi ownerType là 'Dealer'."
    );
  }

  const variantExists = await VehicleVariant.findById(variant);
  if (!variantExists) {
    res.status(404);
    throw new Error("ID variant không hợp lệ hoặc không tồn tại.");
  }

  // Only validate Dealer if ownerType is 'Dealer' and owner is provided
  if (ownerType === 'Dealer' && owner) {
    const dealerExists = await Dealer.findById(owner);
    if (!dealerExists) {
      res.status(404);
      throw new Error("ID đại lý không hợp lệ hoặc không tồn tại.");
    }
  }

  // For EVM inventory, owner can be null or empty string
  const ownerToUse = ownerType === 'EVM' ? null : owner;

  const existingInventory = await Inventory.findOne({ 
    variant, 
    color: color || null, 
    owner: ownerToUse, 
    ownerType 
  });

  if (existingInventory) {
    res.status(400);
    throw new Error(
      "Mục tồn kho cho xe này đã tồn tại. Hãy sử dụng PUT để cập nhật."
    );
  }

  const newInventory = await Inventory.create({
    variant,
    color: color || undefined,
    owner: ownerToUse,
    ownerType,
    quantity,
    location: location || undefined,
  });

  res.status(201).json(newInventory);
});

const updateInventory = asyncHandler(async (req, res) => {
  const { quantity, location } = req.body;
  const { id } = req.params;

  // Only allow updating quantity and location
  // Variant, color, owner, ownerType are immutable (identifiers)
  if (quantity === undefined && location === undefined) {
    res.status(400);
    throw new Error("Vui lòng cung cấp ít nhất một trường để cập nhật (quantity hoặc location).");
  }

  const inventoryItem = await Inventory.findById(id);

  if (!inventoryItem) {
    res.status(404);
    throw new Error(`Không tìm thấy mục tồn kho với ID: ${id}`);
  }

  // Build update object - only allow quantity and location
  const updateData = {};
  if (quantity !== undefined) {
    updateData.quantity = quantity;
  }
  if (location !== undefined) {
    updateData.location = location;
  }

  const updatedInventory = await Inventory.findByIdAndUpdate(
    id,
    updateData,
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

// Additional endpoints
module.exports.getDealerInventory = asyncHandler(async (req, res) => {
  const { dealerId } = req.params;
  const items = await Inventory.find({ owner: dealerId, ownerType: 'Dealer' })
    .populate('variant', 'trim msrp')
    .populate('color', 'name code');
  res.status(200).json(items);
});

module.exports.transferInventory = asyncHandler(async (req, res) => {
  const { variant, color, fromDealerId, toDealerId, quantity } = req.body;
  if (!variant || !fromDealerId || !toDealerId || !quantity) {
    res.status(400);
    throw new Error("variant, fromDealerId, toDealerId, quantity are required");
  }
  if (fromDealerId === toDealerId) {
    res.status(400);
    throw new Error('fromDealerId and toDealerId must be different');
  }

  const fromItem = await Inventory.findOne({ variant, color, owner: fromDealerId, ownerType: 'Dealer' });
  if (!fromItem || fromItem.quantity < quantity) {
    res.status(400);
    throw new Error('Insufficient inventory at source dealer');
  }

  // decrement source
  fromItem.quantity -= quantity;
  await fromItem.save();

  // increment or create destination
  let toItem = await Inventory.findOne({ variant, color, owner: toDealerId, ownerType: 'Dealer' });
  if (toItem) {
    toItem.quantity += quantity;
    await toItem.save();
  } else {
    toItem = await Inventory.create({ variant, color, owner: toDealerId, ownerType: 'Dealer', quantity });
  }

  res.status(200).json({ message: 'Transfer completed', from: fromItem, to: toItem });
});
