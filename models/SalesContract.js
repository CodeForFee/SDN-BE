const mongoose = require('mongoose');

const SalesContractSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    contractNo: { type: String, required: true, index: true },
    signedDate: { type: Date },
    files: [String],
    terms: String,
    status: { type: String, enum: ['draft', 'signed', 'cancelled'], default: 'draft' },
  },
  { timestamps: true }
);

module.exports = mongoose.models.SalesContract || mongoose.model('SalesContract', SalesContractSchema);
