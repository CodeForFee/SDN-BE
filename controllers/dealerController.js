const Dealer = require("../models/Dealer");
const Inventory = require("../models/Inventory");

exports.getDealers = async (req, res) => {
  try {
    const dealers = await Dealer.find();

    res.status(200).json({
      success: true,
      count: dealers.length,
      data: dealers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createDealer = async (req, res) => {
  try {
    const { name, address, region, contact, salesTarget, code, creditLimit } = req.body;

    if (!name || !address) {
      return res.status(400).json({ message: "Name and address are required" });
    }

    // Generate code if not provided
    let dealerCode = code;
    if (!dealerCode) {
      // Auto-generate code from name (first 3 letters + number)
      const namePrefix = name.substring(0, 3).toUpperCase().replace(/\s/g, '');
      const existingDealers = await Dealer.find({ code: new RegExp(`^${namePrefix}`) });
      dealerCode = `${namePrefix}${String(existingDealers.length + 1).padStart(3, '0')}`;
    }

    // Convert contact object to contacts array
    const contacts = [];
    if (contact && (contact.phone || contact.email)) {
      contacts.push({
        name: contact.name || 'Manager',
        phone: contact.phone || '',
        email: contact.email || '',
      });
    }

    const newDealer = {
      name,
      code: dealerCode,
      address,
      region: region || '',
      contacts: contacts.length > 0 ? contacts : [],
      salesTarget: salesTarget || 0,
      creditLimit: creditLimit || 0,
      status: 'active',
    };

    const createDealer = await Dealer.create(newDealer);

    res.status(201).json({
      message: "Create new dealer successfully",
      data: createDealer,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDealerById = async (req, res) => {
  try {
    const dealer = await Dealer.findById(req.params.id);
    if (!dealer) return res.status(404).json({ message: 'Dealer not found' });
    res.status(200).json(dealer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateDealer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, region, contact, salesTarget, creditLimit, status } = req.body;

    // Kiểm tra dealer có tồn tại không
    const dealer = await Dealer.findById(id);
    if (!dealer) {
      return res.status(404).json({ message: "Dealer not found" });
    }

    // Build update object
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (address !== undefined) updateData.address = address;
    if (region !== undefined) updateData.region = region;
    if (salesTarget !== undefined) updateData.salesTarget = salesTarget;
    if (creditLimit !== undefined) updateData.creditLimit = creditLimit;
    if (status !== undefined) updateData.status = status;

    // Handle contacts array - if contact object is provided, update or create first contact
    if (contact !== undefined) {
      const contacts = dealer.contacts || [];
      if (contact.phone || contact.email) {
        if (contacts.length > 0) {
          // Update first contact
          contacts[0] = {
            name: contact.name || contacts[0].name || 'Manager',
            phone: contact.phone || contacts[0].phone || '',
            email: contact.email || contacts[0].email || '',
          };
        } else {
          // Create first contact
          contacts.push({
            name: contact.name || 'Manager',
            phone: contact.phone || '',
            email: contact.email || '',
          });
        }
        updateData.contacts = contacts;
      }
      // If contact is empty and no existing contacts, keep empty array (don't update)
    }

    // Cập nhật thông tin
    const updatedDealer = await Dealer.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Update dealer successfully",
      data: updatedDealer,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteDealer = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra dealer có tồn tại không
    const dealer = await Dealer.findById(id);
    if (!dealer) {
      return res.status(404).json({ message: "Dealer not found" });
    }

    await Dealer.findByIdAndDelete(id);

    res.status(200).json({
      message: "Delete dealer successfully",
      data: dealer,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/dealers/:id/inventory
exports.getDealerInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const dealer = await Dealer.findById(id);
    if (!dealer) return res.status(404).json({ message: "Dealer not found" });

    const items = await Inventory.find({ owner: id, ownerType: 'Dealer' })
      .populate('variant', 'trim msrp')
      .populate('color', 'name code');

    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/dealers/:id/target
exports.updateDealerTarget = async (req, res) => {
  try {
    const { id } = req.params;
    const { salesTarget } = req.body;
    if (salesTarget === undefined) {
      return res.status(400).json({ message: "'salesTarget' is required" });
    }
    const dealer = await Dealer.findByIdAndUpdate(
      id,
      { salesTarget },
      { new: true, runValidators: true }
    );
    if (!dealer) return res.status(404).json({ message: 'Dealer not found' });
    res.status(200).json({ message: 'Updated sales target', data: dealer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
