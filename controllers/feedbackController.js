const Feedback = require('../models/Feedback');

exports.getFeedbacks = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'DealerManager') {
      if (!req.user.dealer) return res.status(400).json({ message: 'User not linked to a dealer' });
      filter.dealer = req.user.dealer;
    }
    const items = await Feedback.find(filter)
      .populate('customer', 'fullName phone')
      .populate('dealer', 'name')
      .populate('createdBy', 'email');
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
    const updated = await Feedback.findByIdAndUpdate(id, { status }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Feedback not found' });
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


