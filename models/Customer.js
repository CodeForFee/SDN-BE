const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, index: true },
    email: { type: String, index: true },
    idNumber: String,
    address: String,
    segment: { type: String, enum: ['retail', 'fleet'], default: 'retail' },
    notes: String,
    ownerDealer: { type: mongoose.Schema.Types.ObjectId, ref: 'Dealer' },
    ownerUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // Debt sẽ được tính dynamic, không lưu trong schema
    // Có thể thêm field này nếu cần cache, nhưng nên tính toán real-time từ orders và payments
  },
  { timestamps: true }
);

module.exports = mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);
