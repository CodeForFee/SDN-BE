const TestDrive = require('../models/TestDrive');

exports.getTestDrives = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'DealerStaff' || req.user.role === 'DealerManager') {
      if (!req.user.dealer) return res.status(400).json({ message: 'User not linked to a dealer' });
      filter.dealer = req.user.dealer;
    }
    const items = await TestDrive.find(filter)
      .populate('customer', 'fullName phone')
      .populate('dealer', 'name')
      .populate('variant', 'trim');
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTestDriveById = async (req, res) => {
  try {
    const item = await TestDrive.findById(req.params.id)
      .populate('customer', 'fullName phone')
      .populate('dealer', 'name')
      .populate('variant', 'trim');
    if (!item) return res.status(404).json({ message: 'Test drive not found' });
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createTestDrive = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (!payload.dealer && req.user.dealer) payload.dealer = req.user.dealer;
    const created = await TestDrive.create(payload);
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateTestDrive = async (req, res) => {
  try {
    const updated = await TestDrive.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Test drive not found' });
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteTestDrive = async (req, res) => {
  try {
    const deleted = await TestDrive.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Test drive not found' });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


