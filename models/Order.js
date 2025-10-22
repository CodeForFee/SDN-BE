const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema(
  {
    variant: { type: mongoose.Schema.Types.ObjectId, ref: 'VehicleVariant', required: true },
    color: { type: mongoose.Schema.Types.ObjectId, ref: 'VehicleColor' },
    qty: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true },
    vins: [String],
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    orderNo: { type: String, index: true },
    dealer: { type: mongoose.Schema.Types.ObjectId, ref: 'Dealer', required: true },
    sales: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    quote: { type: mongoose.Schema.Types.ObjectId, ref: 'Quote' },
    items: { type: [OrderItemSchema], default: [] },
    paymentMethod: { type: String, enum: ['cash', 'finance'], default: 'cash' },
    deposit: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['new', 'confirmed', 'allocated', 'invoiced', 'delivered', 'cancelled'],
      default: 'new',
    },
    expectedDelivery: { type: Date },
    actualDelivery: { type: Date },
    logs: [{ at: Date, by: String, action: String, note: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.models.Order || mongoose.model('Order', OrderSchema);
