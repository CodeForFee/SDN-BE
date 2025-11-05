const Delivery = require('../models/Delivery');

exports.getAllDeliveries = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userRole = req.user.role;
    
    let filter = {};
    
    // Dealer Staff/Manager chỉ xem deliveries của dealer mình
    if (userRole === "DealerStaff" || userRole === "DealerManager") {
      if (req.user.dealer) {
        // Populate order để lọc theo dealer
        const deliveries = await Delivery.find()
          .populate({
            path: 'order',
            match: { dealer: req.user.dealer },
            select: 'orderNo dealer customer',
            populate: {
              path: 'customer',
              select: 'fullName phone'
            }
          })
          .sort({ createdAt: -1 });
          
        // Filter out deliveries where order is null (không thuộc dealer này)
        const filteredDeliveries = deliveries.filter(delivery => delivery.order !== null);
        
        // Manual pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedDeliveries = filteredDeliveries.slice(startIndex, endIndex);
        
        return res.status(200).json({
          success: true,
          data: paginatedDeliveries,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: filteredDeliveries.length,
            pages: Math.ceil(filteredDeliveries.length / limit)
          }
        });
      } else {
        return res.status(400).json({ 
          message: "Tài khoản đại lý chưa được liên kết với đại lý nào." 
        });
      }
    }
    
    // Admin có thể xem tất cả
    const skip = (page - 1) * limit;
    const deliveries = await Delivery.find(filter)
      .populate({
        path: 'order',
        select: 'orderNo dealer customer',
        populate: {
          path: 'customer',
          select: 'fullName phone'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
      
    const total = await Delivery.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      data: deliveries,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createDelivery = async (req, res) => {
  try {
    const created = await Delivery.create(req.body);
    const populated = await Delivery.findById(created._id)
      .populate({
        path: 'order',
        select: 'orderNo dealer customer',
        populate: {
          path: 'customer',
          select: 'fullName phone'
        }
      });
    res.status(201).json(populated || created);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    const delivery = await Delivery.findById(id).populate({
      path: 'order',
      select: 'dealer'
    });
    
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }
    
    // Check permission - DealerStaff/Manager can only update deliveries of their dealer
    const userRole = req.user.role;
    if (userRole === 'DealerStaff' || userRole === 'DealerManager') {
      if (!req.user.dealer || !delivery.order) {
        return res.status(400).json({ message: 'User or order not linked to a dealer' });
      }
      if (delivery.order.dealer.toString() !== req.user.dealer.toString()) {
        return res.status(403).json({ message: 'You do not have permission to update this delivery' });
      }
    }
    
    const updateData = { status };
    if (notes !== undefined) updateData.notes = notes;
    
    const updated = await Delivery.findByIdAndUpdate(id, updateData, { new: true })
      .populate({
        path: 'order',
        select: 'orderNo dealer customer',
        populate: {
          path: 'customer',
          select: 'fullName phone'
        }
      });
    
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getDeliveryByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const items = await Delivery.find({ order: orderId })
      .populate({
        path: 'order',
        select: 'orderNo dealer customer',
        populate: {
          path: 'customer',
          select: 'fullName phone'
        }
      });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


