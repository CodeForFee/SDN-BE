const VehicleModel = require('../models/VehicleModel');

exports.list = async (req, res) => {
  try {
    const items = await VehicleModel.find();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.get = async (req, res) => {
  try {
    const item = await VehicleModel.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const created = await VehicleModel.create(req.body);
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const updated = await VehicleModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const deleted = await VehicleModel.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


