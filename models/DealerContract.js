const mongoose = require('mongoose');

const DealerContractSchema = new mongoose.Schema(
  {
    contractNo: { type: String, required: true, unique: true, index: true },
    dealer: { type: mongoose.Schema.Types.ObjectId, ref: 'Dealer', required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }, // Optional: link to specific order
    contractType: { 
      type: String, 
      enum: ['distribution', 'purchase', 'consignment'], 
      default: 'distribution' 
    },
    totalAmount: { type: Number, required: true }, // Tổng giá trị hợp đồng
    paidAmount: { type: Number, default: 0 }, // Số tiền đã thanh toán
    debtAmount: { type: Number, default: 0 }, // Số tiền còn nợ (tính dynamic: totalAmount - paidAmount)
    signedDate: { type: Date },
    effectiveDate: { type: Date }, // Ngày có hiệu lực
    expiryDate: { type: Date }, // Ngày hết hạn
    status: { 
      type: String, 
      enum: ['draft', 'active', 'completed', 'cancelled'], 
      default: 'draft' 
    },
    terms: String, // Điều khoản hợp đồng
    discountPolicy: { 
      discountRate: { type: Number, default: 0 }, // Tỷ lệ chiết khấu (%)
      creditLimit: { type: Number, default: 0 }, // Hạn mức công nợ
      paymentTerm: { type: Number, default: 30 }, // Thời hạn thanh toán (ngày)
    },
    files: [String], // Danh sách file hợp đồng
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // EVM Staff who created
    notes: String,
  },
  { timestamps: true }
);

// Calculate debt before save
DealerContractSchema.pre('save', function(next) {
  if (this.isModified('paidAmount') || this.isModified('totalAmount') || this.isNew) {
    this.debtAmount = this.totalAmount - this.paidAmount;
    
    // Auto update status
    if (this.debtAmount <= 0 && this.status === 'active') {
      this.status = 'completed';
    }
  }
  next();
});

// Indexes
DealerContractSchema.index({ dealer: 1 });
DealerContractSchema.index({ order: 1 });
DealerContractSchema.index({ status: 1 });
DealerContractSchema.index({ contractNo: 1 });

module.exports = mongoose.models.DealerContract || mongoose.model('DealerContract', DealerContractSchema);

