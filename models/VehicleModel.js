const mongoose = require('mongoose');

const VehicleModelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    brand: { type: String, default: 'EVM' },
    segment: String,
    description: String,
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.models.VehicleModel || mongoose.model('VehicleModel', VehicleModelSchema);
