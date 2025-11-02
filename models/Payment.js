const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    type: { type: String, enum: ['deposit', 'balance', 'finance'], required: true },
    amount: { type: Number, required: true },
    method: { type: String, enum: ['cash', 'bank', 'loan'], required: true },
    payerType: { 
      type: String, 
      enum: ['customer', 'dealer'], 
      default: 'customer' 
    }, // Phân biệt: customer thanh toán cho dealer, hoặc dealer thanh toán cho EVM
    dealerContract: { type: mongoose.Schema.Types.ObjectId, ref: 'DealerContract' }, // Link nếu là payment từ dealer → EVM
    installmentPlan: { type: mongoose.Schema.Types.ObjectId, ref: 'InstallmentPlan' }, // Link nếu là payment từ installment plan
    installmentPaymentId: { type: mongoose.Schema.Types.ObjectId }, // Link đến InstallmentPayment trong InstallmentPlan
    transactionRef: { type: String },
    paidAt: { type: Date },
    status: { type: String, enum: ['pending', 'confirmed', 'failed'], default: 'pending' },
    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);
