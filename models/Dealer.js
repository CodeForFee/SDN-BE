const mongoose = require('mongoose');

const DealerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    region: String,
    address: String,
    contacts: [{ name: String, phone: String, email: String }],
    contract: { type: mongoose.Schema.Types.ObjectId, ref: 'DealerContract' },
    creditLimit: { type: Number, default: 0 },
    salesTarget: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Dealer || mongoose.model('Dealer', DealerSchema);
