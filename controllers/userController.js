const User = require('../models/User');

exports.listUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-passwordHash');
    res.status(200).json(users);
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


