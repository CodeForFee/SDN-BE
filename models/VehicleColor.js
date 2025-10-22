const mongoose = require('mongoose');

const VehicleColorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String },
    hex: { type: String },
    extraPrice: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.models.VehicleColor || mongoose.model('VehicleColor', VehicleColorSchema);
