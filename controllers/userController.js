const User = require('../models/User');

exports.listUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-passwordHash');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get Dealer Staff list (for Dealer Manager)
exports.getDealerStaff = async (req, res) => {
  try {
    const userRole = req.user.role;
    
    // Only Dealer Manager can view staff of their dealer
    if (userRole !== "DealerManager" && userRole !== "Admin") {
      return res.status(403).json({ 
        message: "Only Dealer Manager and Admin can view dealer staff list" 
      });
    }

    let filter = { role: 'DealerStaff' };
    
    // Dealer Manager can only see staff of their own dealer
    if (userRole === "DealerManager") {
      if (!req.user.dealer) {
        return res.status(400).json({ 
          message: "Dealer Manager account is not linked to a dealer" 
        });
      }
      filter.dealer = req.user.dealer;
    } else if (userRole === "Admin") {
      // Admin can filter by dealer if provided
      if (req.query.dealerId) {
        filter.dealer = req.query.dealerId;
      }
    }

    const staff = await User.find(filter, '-passwordHash')
      .populate('dealer', 'name region address')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: staff.length,
      data: staff,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, profile, dealer, status } = req.body;
    const update = { role, profile, dealer, status };
    const updated = await User.findByIdAndUpdate(id, update, { new: true, select: '-passwordHash' });
    if (!updated) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


