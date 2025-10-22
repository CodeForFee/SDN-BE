const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema(
  {
    ownerType: { type: String, enum: ['EVM', 'Dealer'], required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Dealer' },
    variant: { type: mongoose.Schema.Types.ObjectId, ref: 'VehicleVariant', required: true },
    color: { type: mongoose.Schema.Types.ObjectId, ref: 'VehicleColor' },
    quantity: { type: Number, default: 0 },
    reserved: { type: Number, default: 0 },
    vinList: [String],
    location: String,
  },
  { timestamps: true }
);

InventorySchema.index({ ownerType: 1, owner: 1, variant: 1, color: 1 }, { unique: true, sparse: true });

module.exports = mongoose.models.Inventory || mongoose.model('Inventory', InventorySchema);
