const Delivery = require('../models/Delivery');

exports.createDelivery = async (req, res) => {
  try {
    const created = await Delivery.create(req.body);
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await Delivery.findByIdAndUpdate(id, { status }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Delivery not found' });
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getDeliveryByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const items = await Delivery.find({ order: orderId });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


