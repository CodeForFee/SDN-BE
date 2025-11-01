const mongoose = require('mongoose');

const DeliverySchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    address: { type: String },
    scheduledAt: { type: Date },
    status: { type: String, enum: ['pending', 'in_progress', 'delivered'], default: 'pending' },
    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.models.Delivery || mongoose.model('Delivery', DeliverySchema);


