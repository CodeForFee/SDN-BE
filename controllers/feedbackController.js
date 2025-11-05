const Feedback = require('../models/Feedback');

exports.getFeedbacks = async (req, res) => {
  try {
    const filter = {};
    // DealerStaff và DealerManager chỉ xem feedbacks của dealer mình
    if (req.user.role === 'DealerManager' || req.user.role === 'DealerStaff') {
      if (!req.user.dealer) {
        return res.status(400).json({ message: 'User not linked to a dealer' });
      }
      filter.dealer = req.user.dealer;
    }
    const items = await Feedback.find(filter)
      .populate('customer', 'fullName phone')
      .populate('dealer', 'name')
      .populate('createdBy', 'email profile.name')
      .populate('forwardedTo', 'email profile.name')
      .populate('forwardedBy', 'email profile.name');
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createFeedback = async (req, res) => {
  try {
    const payload = { ...req.body, createdBy: req.user._id };
    if (!payload.dealer && req.user.dealer) payload.dealer = req.user.dealer;
    const created = await Feedback.create(payload);
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateFeedbackStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await Feedback.findByIdAndUpdate(
      id,
      {
        status,
        $push: {
          logs: {
            at: new Date(),
            by: req.user.email || req.user._id.toString(),
            action: 'status_update',
            note: `Status changed to ${status}`,
          }
        }
      },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Feedback not found' });
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc Forward feedback to Dealer Manager (Dealer Staff)
exports.forwardFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    const feedback = await Feedback.findById(id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    // Check permission - only Dealer Staff of the same dealer can forward
    const userRole = req.user.role;
    if (userRole !== 'DealerStaff') {
      return res.status(403).json({ 
        message: 'Only Dealer Staff can forward feedback to manager' 
      });
    }

    if (!req.user.dealer) {
      return res.status(400).json({ 
        message: 'User account is not linked to a dealer' 
      });
    }

    if (feedback.dealer.toString() !== req.user.dealer.toString()) {
      return res.status(403).json({ 
        message: 'You can only forward feedback from your dealer' 
      });
    }

    if (feedback.forwardedTo) {
      return res.status(400).json({ 
        message: 'Feedback has already been forwarded' 
      });
    }

    // Find Dealer Manager for this dealer
    const User = require('../models/User');
    const dealerManager = await User.findOne({
      dealer: req.user.dealer,
      role: 'DealerManager',
    });

    if (!dealerManager) {
      return res.status(404).json({ 
        message: 'Dealer Manager not found for this dealer' 
      });
    }

    const updated = await Feedback.findByIdAndUpdate(
      id,
      {
        forwardedTo: dealerManager._id,
        forwardedAt: new Date(),
        forwardedBy: req.user._id,
        forwardedNote: note || 'Forwarded to manager for review',
        status: 'in_progress', // Mark as in progress when forwarded
        $push: {
          logs: {
            at: new Date(),
            by: req.user.email || req.user._id.toString(),
            action: 'forwarded',
            note: note || 'Forwarded to Dealer Manager',
          }
        }
      },
      { new: true }
    )
      .populate('customer', 'fullName phone')
      .populate('dealer', 'name')
      .populate('createdBy', 'email profile.name')
      .populate('forwardedTo', 'email profile.name')
      .populate('forwardedBy', 'email profile.name');

    res.status(200).json({
      message: 'Feedback forwarded to Dealer Manager successfully',
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


