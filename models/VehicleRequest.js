const mongoose = require('mongoose');

const VehicleRequestSchema = new mongoose.Schema(
  {
    requestNo: { type: String, required: true, unique: true, index: true },
    dealer: { type: mongoose.Schema.Types.ObjectId, ref: 'Dealer', required: true },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
      {
        variant: { type: mongoose.Schema.Types.ObjectId, ref: 'VehicleVariant', required: true },
        color: { type: mongoose.Schema.Types.ObjectId, ref: 'VehicleColor' },
        quantity: { type: Number, required: true, min: 1 },
        reason: String,
      }
    ],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'fulfilled', 'cancelled'],
      default: 'pending',
    },
    requestedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rejectionReason: String,
    notes: String,
    logs: [
      {
        at: Date,
        by: String,
        action: String,
        note: String,
      }
    ],
  },
  { timestamps: true }
);

// Generate request number before validation (runs before required field validation)
VehicleRequestSchema.pre('validate', async function (next) {
  if (!this.requestNo && this.isNew) {
    try {
      const count = await mongoose.models.VehicleRequest?.countDocuments() || 0;
      this.requestNo = `VR-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    } catch (error) {
      // Fallback if countDocuments fails
      this.requestNo = `VR-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    }
  }
  next();
});

module.exports = mongoose.models.VehicleRequest || mongoose.model('VehicleRequest', VehicleRequestSchema);

