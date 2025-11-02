const mongoose = require('mongoose');

const VehicleVariantSchema = new mongoose.Schema(
  {
    model: { type: mongoose.Schema.Types.ObjectId, ref: 'VehicleModel', required: true },
    trim: { type: String, required: true },
    battery: String,
    range: Number,
    motorPower: Number,
    features: [String],
    msrp: { type: Number, required: true },
    images: [String],
    colors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'VehicleColor' }],
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

VehicleVariantSchema.index({ model: 1, trim: 1 }, { unique: true });

module.exports = mongoose.models.VehicleVariant || mongoose.model('VehicleVariant', VehicleVariantSchema);
