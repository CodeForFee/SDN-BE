const Dealer = require("../models/Dealer");
const Inventory = require("../models/Inventory");

exports.getDealers = async (req, res) => {
  try {
    const dealers = await Dealer.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: dealers.length,
      data: dealers,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.createDealer = async (req, res) => {
  try {
    const { name, address, region, contact, salesTarget, code, creditLimit } = req.body;

    // Validation
    if (!name || !address) {
      return res.status(400).json({ 
        success: false,
        message: "Name and address are required" 
      });
    }

    // Check for duplicate code if provided
    if (code) {
      const existingDealer = await Dealer.findOne({ code });
      if (existingDealer) {
        return res.status(400).json({ 
          success: false,
          message: "Dealer code already exists" 
        });
      }
    }

    // Generate code if not provided
    let dealerCode = code;
    if (!dealerCode) {
      // Auto-generate code from name (first 3 letters + number)
      const namePrefix = name.substring(0, 3).toUpperCase().replace(/\s/g, '');
      const existingDealers = await Dealer.find({ code: new RegExp(`^${namePrefix}`) });
      let newCodeNumber = existingDealers.length + 1;
      dealerCode = `${namePrefix}${String(newCodeNumber).padStart(3, '0')}`;
      
      // Ensure uniqueness
      while (await Dealer.findOne({ code: dealerCode })) {
        newCodeNumber++;
        dealerCode = `${namePrefix}${String(newCodeNumber).padStart(3, '0')}`;
      }
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
      success: true,
      message: "Create new dealer successfully",
      data: createDealer,
    });
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: "Dealer code already exists" 
      });
    }
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.getDealerById = async (req, res) => {
  try {
    const dealer = await Dealer.findById(req.params.id);
    if (!dealer) {
      return res.status(404).json({ 
        success: false,
        message: 'Dealer not found' 
      });
    }
    res.status(200).json({
      success: true,
      data: dealer,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.updateDealer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, region, contact, salesTarget, creditLimit, status, code } = req.body;

    // Kiểm tra dealer có tồn tại không
    const dealer = await Dealer.findById(id);
    if (!dealer) {
      return res.status(404).json({ 
        success: false,
        message: "Dealer not found" 
      });
    }

    // Check for duplicate code if code is being updated
    if (code && code !== dealer.code) {
      const existingDealer = await Dealer.findOne({ code });
      if (existingDealer) {
        return res.status(400).json({ 
          success: false,
          message: "Dealer code already exists" 
        });
      }
    }

    // Build update object
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (address !== undefined) updateData.address = address;
    if (region !== undefined) updateData.region = region;
    if (code !== undefined) updateData.code = code;
    if (salesTarget !== undefined) updateData.salesTarget = salesTarget;
    if (creditLimit !== undefined) updateData.creditLimit = creditLimit;
    if (status !== undefined) updateData.status = status;

    // Handle contacts array - if contact object is provided, update or create first contact
    if (contact !== undefined) {
      const contacts = [...(dealer.contacts || [])];
      if (contact.phone || contact.email || contact.name) {
        if (contacts.length > 0) {
          // Update first contact
          contacts[0] = {
            name: contact.name !== undefined ? contact.name : (contacts[0].name || 'Manager'),
            phone: contact.phone !== undefined ? contact.phone : (contacts[0].phone || ''),
            email: contact.email !== undefined ? contact.email : (contacts[0].email || ''),
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
    }

    // Cập nhật thông tin
    const updatedDealer = await Dealer.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Update dealer successfully",
      data: updatedDealer,
    });
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: "Dealer code already exists" 
      });
    }
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.deleteDealer = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra dealer có tồn tại không
    const dealer = await Dealer.findById(id);
    if (!dealer) {
      return res.status(404).json({ 
        success: false,
        message: "Dealer not found" 
      });
    }

    // Check if dealer has inventory
    const inventoryCount = await Inventory.countDocuments({ owner: id, ownerType: 'Dealer' });
    if (inventoryCount > 0) {
      return res.status(400).json({ 
        success: false,
        message: `Cannot delete dealer. Dealer has ${inventoryCount} inventory item(s). Please remove inventory first.` 
      });
    }

    await Dealer.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Delete dealer successfully",
      data: dealer,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// GET /api/dealers/:id/inventory
exports.getDealerInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const dealer = await Dealer.findById(id);
    if (!dealer) {
      return res.status(404).json({ 
        success: false,
        message: "Dealer not found" 
      });
    }

    const items = await Inventory.find({ owner: id, ownerType: 'Dealer' })
      .populate('variant', 'trim msrp')
      .populate('color', 'name code');

    res.status(200).json({ 
      success: true, 
      count: items.length, 
      data: items 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// PUT /api/dealers/:id/target
exports.updateDealerTarget = async (req, res) => {
  try {
    const { id } = req.params;
    const { salesTarget } = req.body;
    
    if (salesTarget === undefined) {
      return res.status(400).json({ 
        success: false,
        message: "'salesTarget' is required" 
      });
    }

    if (typeof salesTarget !== 'number' || salesTarget < 0) {
      return res.status(400).json({ 
        success: false,
        message: "Sales target must be a non-negative number" 
      });
    }

    const dealer = await Dealer.findByIdAndUpdate(
      id,
      { salesTarget },
      { new: true, runValidators: true }
    );
    
    if (!dealer) {
      return res.status(404).json({ 
        success: false,
        message: 'Dealer not found' 
      });
    }
    
    res.status(200).json({ 
      success: true,
      message: 'Updated sales target successfully', 
      data: dealer 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};
