const mongoose = require('mongoose');

const InstallmentPaymentSchema = new mongoose.Schema(
  {
    installmentNumber: { type: Number, required: true }, // Số kỳ (1, 2, 3...)
    dueDate: { type: Date, required: true },
    amount: { type: Number, required: true },
    status: { 
      type: String, 
      enum: ['pending', 'paid', 'overdue', 'skipped'], 
      default: 'pending' 
    },
    paidAt: { type: Date },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' }, // Link to actual Payment record
    notes: String,
  },
  { _id: true }
);

const InstallmentPlanSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    dealer: { type: mongoose.Schema.Types.ObjectId, ref: 'Dealer', required: true },
    totalAmount: { type: Number, required: true }, // Tổng số tiền cần trả
    paidAmount: { type: Number, default: 0 }, // Tổng số tiền đã trả
    remainingAmount: { type: Number, required: true }, // Số tiền còn lại
    installmentCount: { type: Number, required: true, min: 1 }, // Tổng số kỳ
    installmentPeriod: { type: String, enum: ['monthly', 'quarterly', 'yearly'], default: 'monthly' }, // Chu kỳ trả
    payments: { type: [InstallmentPaymentSchema], default: [] },
    startDate: { type: Date, required: true }, // Ngày bắt đầu trả góp
    status: { 
      type: String, 
      enum: ['active', 'completed', 'cancelled'], 
      default: 'active' 
    },
    notes: String,
  },
  { timestamps: true }
);

// Calculate remaining amount before save
InstallmentPlanSchema.pre('save', function(next) {
  if (this.isModified('paidAmount') || this.isNew) {
    this.remainingAmount = this.totalAmount - this.paidAmount;
    
    // Auto update status
    if (this.remainingAmount <= 0) {
      this.status = 'completed';
    }
  }
  next();
});

// Index for efficient queries
InstallmentPlanSchema.index({ order: 1 });
InstallmentPlanSchema.index({ customer: 1 });
InstallmentPlanSchema.index({ dealer: 1 });
InstallmentPlanSchema.index({ status: 1 });

module.exports = mongoose.models.InstallmentPlan || mongoose.model('InstallmentPlan', InstallmentPlanSchema);

