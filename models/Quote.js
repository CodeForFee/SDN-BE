const mongoose = require('mongoose');

const QuoteItemSchema = new mongoose.Schema(
  {
    variant: { type: mongoose.Schema.Types.ObjectId, ref: 'VehicleVariant', required: true },
    color: { type: mongoose.Schema.Types.ObjectId, ref: 'VehicleColor' },
    qty: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true },
    promotionApplied: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Promotion' }],
  },
  { _id: false }
);

const QuoteSchema = new mongoose.Schema(
  {
    dealer: { type: mongoose.Schema.Types.ObjectId, ref: 'Dealer', required: true },
    sales: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    items: { type: [QuoteItemSchema], default: [] },
    subtotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    promotionTotal: { type: Number, default: 0 },
    fees: {
      registration: { type: Number, default: 0 },
      plate: { type: Number, default: 0 },
      delivery: { type: Number, default: 0 },
    },
    total: { type: Number, default: 0 },
    validUntil: { type: Date },
    status: { type: String, enum: ['draft', 'sent', 'accepted', 'rejected'], default: 'draft' },
    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.models.Quote || mongoose.model('Quote', QuoteSchema);
