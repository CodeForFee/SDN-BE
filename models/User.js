const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['DealerStaff', 'DealerManager', 'EVMStaff', 'Admin'],
      required: true,
    },
    dealer: { type: mongoose.Schema.Types.ObjectId, ref: 'Dealer' },
    profile: {
      name: String,
      phone: String,
    },
    status: { type: String, enum: ['active', 'locked'], default: 'active' },
  },
  { timestamps: true }
);

// Method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

// Export ROLES for validation
const ROLES = ['DealerStaff', 'DealerManager', 'EVMStaff', 'Admin'];

const User = mongoose.models.User || mongoose.model('User', UserSchema);

module.exports = User;
module.exports.ROLES = ROLES;
