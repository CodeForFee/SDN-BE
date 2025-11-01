const SalesContract = require('../models/SalesContract');

exports.getContracts = async (req, res) => {
  try {
    const items = await SalesContract.find().populate('dealer', 'name');
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getContractById = async (req, res) => {
  try {
    const item = await SalesContract.findById(req.params.id).populate('dealer', 'name');
    if (!item) return res.status(404).json({ message: 'Contract not found' });
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createContract = async (req, res) => {
  try {
    const created = await SalesContract.create(req.body);
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateContract = async (req, res) => {
  try {
    const updated = await SalesContract.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Contract not found' });
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


