const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    type: { type: String, enum: ['deposit', 'balance', 'finance'], required: true },
    amount: { type: Number, required: true },
    method: { type: String, enum: ['cash', 'bank', 'loan'], required: true },
    transactionRef: { type: String },
    paidAt: { type: Date },
    status: { type: String, enum: ['pending', 'confirmed', 'failed'], default: 'pending' },
    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);
