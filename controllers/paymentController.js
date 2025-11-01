const Payment = require('../models/Payment');

exports.createPayment = async (req, res) => {
  try {
    const created = await Payment.create(req.body);
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getPaymentsByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const items = await Payment.find({ order: orderId });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await Payment.findByIdAndUpdate(id, { status }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Payment not found' });
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


