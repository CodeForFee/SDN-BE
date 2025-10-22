const mongoose = require('mongoose');

const TestDriveSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    dealer: { type: mongoose.Schema.Types.ObjectId, ref: 'Dealer', required: true },
    variant: { type: mongoose.Schema.Types.ObjectId, ref: 'VehicleVariant', required: true },
    preferredTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ['requested', 'confirmed', 'done', 'cancelled'],
      default: 'requested',
    },
    result: { feedback: String, interestRate: Number },
    assignedStaff: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.models.TestDrive || mongoose.model('TestDrive', TestDriveSchema);
