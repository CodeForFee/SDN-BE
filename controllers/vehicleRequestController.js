const VehicleRequest = require('../models/VehicleRequest');
const Dealer = require('../models/Dealer');
const VehicleVariant = require('../models/VehicleVariant');
const Inventory = require('../models/Inventory');

// @desc Get all vehicle requests
exports.getVehicleRequests = async (req, res) => {
  try {
    let filter = {};
    const userRole = req.user.role;

    // Dealer Manager/Staff can only see requests from their dealer
    if (userRole === 'DealerManager' || userRole === 'DealerStaff') {
      if (!req.user.dealer) {
        return res.status(400).json({ 
          message: 'User account is not linked to a dealer' 
        });
      }
      filter.dealer = req.user.dealer;
    }

    // EVM Staff can filter by dealer
    if (userRole === 'EVMStaff' && req.query.dealerId) {
      filter.dealer = req.query.dealerId;
    }

    // Filter by status if provided
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const requests = await VehicleRequest.find(filter)
      .populate('dealer', 'name region address')
      .populate('requestedBy', 'email profile.name')
      .populate('reviewedBy', 'email profile.name')
      .populate({
        path: 'items.variant',
        select: 'trim msrp model',
        populate: {
          path: 'model',
          select: 'name brand'
        }
      })
      .populate({
        path: 'items.color',
        select: 'name code'
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get vehicle request by ID
exports.getVehicleRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await VehicleRequest.findById(id)
      .populate('dealer', 'name region address')
      .populate('requestedBy', 'email profile.name')
      .populate('reviewedBy', 'email profile.name')
      .populate({
        path: 'items.variant',
        select: 'trim msrp model',
        populate: {
          path: 'model',
          select: 'name brand'
        }
      })
      .populate({
        path: 'items.color',
        select: 'name code'
      });

    if (!request) {
      return res.status(404).json({ message: 'Vehicle request not found' });
    }

    // Check permission
    const userRole = req.user.role;
    if (
      (userRole === 'DealerManager' || userRole === 'DealerStaff') &&
      req.user.dealer.toString() !== request.dealer._id.toString()
    ) {
      return res.status(403).json({ 
        message: 'You do not have permission to view this request' 
      });
    }

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Create vehicle request (Dealer Manager/Staff)
exports.createVehicleRequest = async (req, res) => {
  try {
    const { items, notes } = req.body;
    const dealer = req.user.dealer;
    const requestedBy = req.user._id;

    if (!items || !items.length) {
      return res.status(400).json({ 
        message: 'At least one item is required' 
      });
    }

    if (!dealer) {
      return res.status(400).json({ 
        message: 'User account is not linked to a dealer' 
      });
    }

    // Validate items
    for (const item of items) {
      if (!item.variant || !item.quantity) {
        return res.status(400).json({ 
          message: 'Each item must have variant and quantity' 
        });
      }

      const variantExists = await VehicleVariant.findById(item.variant);
      if (!variantExists) {
        return res.status(404).json({ 
          message: `Variant ${item.variant} not found` 
        });
      }
    }

    const newRequest = await VehicleRequest.create({
      dealer,
      requestedBy,
      items,
      notes,
      status: 'pending',
    });

    const populatedRequest = await VehicleRequest.findById(newRequest._id)
      .populate('dealer', 'name region address')
      .populate('requestedBy', 'email profile.name')
      .populate({
        path: 'items.variant',
        select: 'trim msrp model',
        populate: {
          path: 'model',
          select: 'name brand'
        }
      })
      .populate({
        path: 'items.color',
        select: 'name code'
      });

    res.status(201).json({
      message: 'Vehicle request created successfully',
      data: populatedRequest,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Approve vehicle request (EVM Staff)
exports.approveVehicleRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const request = await VehicleRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Vehicle request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ 
        message: `Request cannot be approved. Current status: ${request.status}` 
      });
    }

    // Check inventory availability for each item
    // Available = quantity - reserved
    for (const item of request.items) {
      const inventory = await Inventory.findOne({
        ownerType: 'EVM',
        variant: item.variant,
        color: item.color || null,
      });

      if (!inventory) {
        return res.status(400).json({
          message: `Inventory not found for variant ${item.variant}. Please create inventory first.`
        });
      }

      const available = (inventory.quantity || 0) - (inventory.reserved || 0);
      
      if (available < item.quantity) {
        return res.status(400).json({
          message: `Insufficient inventory for variant ${item.variant}. Available: ${available}, Requested: ${item.quantity}, Total: ${inventory.quantity || 0}, Reserved: ${inventory.reserved || 0}`
        });
      }
    }

    // Reserve inventory when approving the request
    for (const item of request.items) {
      await Inventory.findOneAndUpdate(
        {
          ownerType: 'EVM',
          variant: item.variant,
          color: item.color || null,
        },
        {
          $inc: { reserved: item.quantity }
        }
      );
    }

    // Approve the request
    const updatedRequest = await VehicleRequest.findByIdAndUpdate(
      id,
      {
        status: 'approved',
        reviewedAt: new Date(),
        reviewedBy: req.user._id,
        $push: {
          logs: {
            at: new Date(),
            by: req.user.email || req.user._id.toString(),
            action: 'approved',
            note: notes || 'Request approved by EVM Staff',
          }
        }
      },
      { new: true }
    )
      .populate('dealer', 'name region address')
      .populate('requestedBy', 'email profile.name')
      .populate('reviewedBy', 'email profile.name')
      .populate({
        path: 'items.variant',
        select: 'trim msrp model',
        populate: {
          path: 'model',
          select: 'name brand'
        }
      })
      .populate({
        path: 'items.color',
        select: 'name code'
      });

    res.status(200).json({
      message: 'Vehicle request approved successfully',
      data: updatedRequest,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Reject vehicle request (EVM Staff)
exports.rejectVehicleRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const request = await VehicleRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Vehicle request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ 
        message: `Request cannot be rejected. Current status: ${request.status}` 
      });
    }

    const updatedRequest = await VehicleRequest.findByIdAndUpdate(
      id,
      {
        status: 'rejected',
        reviewedAt: new Date(),
        reviewedBy: req.user._id,
        rejectionReason: reason,
        $push: {
          logs: {
            at: new Date(),
            by: req.user.email || req.user._id.toString(),
            action: 'rejected',
            note: reason,
          }
        }
      },
      { new: true }
    )
      .populate('dealer', 'name region address')
      .populate('requestedBy', 'email profile.name')
      .populate('reviewedBy', 'email profile.name')
      .populate({
        path: 'items.variant',
        select: 'trim msrp model',
        populate: {
          path: 'model',
          select: 'name brand'
        }
      })
      .populate({
        path: 'items.color',
        select: 'name code'
      });

    res.status(200).json({
      message: 'Vehicle request rejected successfully',
      data: updatedRequest,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Cancel vehicle request (Dealer Manager/Staff)
exports.cancelVehicleRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await VehicleRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Vehicle request not found' });
    }

    // Check permission
    const userRole = req.user.role;
    if (
      (userRole === 'DealerManager' || userRole === 'DealerStaff') &&
      req.user.dealer.toString() !== request.dealer.toString()
    ) {
      return res.status(403).json({ 
        message: 'You do not have permission to cancel this request' 
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ 
        message: `Request cannot be cancelled. Current status: ${request.status}` 
      });
    }

    const updatedRequest = await VehicleRequest.findByIdAndUpdate(
      id,
      {
        status: 'cancelled',
        $push: {
          logs: {
            at: new Date(),
            by: req.user.email || req.user._id.toString(),
            action: 'cancelled',
            note: 'Request cancelled by dealer',
          }
        }
      },
      { new: true }
    )
      .populate('dealer', 'name region address')
      .populate('requestedBy', 'email profile.name')
      .populate({
        path: 'items.variant',
        select: 'trim msrp model',
        populate: {
          path: 'model',
          select: 'name brand'
        }
      })
      .populate({
        path: 'items.color',
        select: 'name code'
      });

    res.status(200).json({
      message: 'Vehicle request cancelled successfully',
      data: updatedRequest,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

