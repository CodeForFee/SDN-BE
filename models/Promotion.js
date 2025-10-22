const mongoose = require('mongoose');

const PromotionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    scope: { type: String, enum: ['global', 'byDealer', 'byVariant'], default: 'global' },
    dealers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Dealer' }],
    variants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'VehicleVariant' }],
    type: { type: String, enum: ['cashback', 'accessory', 'finance'], default: 'cashback' },
    value: { type: Number, default: 0 },
    stackable: { type: Boolean, default: false },
    validFrom: { type: Date, required: true },
    validTo: { type: Date, required: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Promotion || mongoose.model('Promotion', PromotionSchema);
