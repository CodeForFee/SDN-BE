const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const ROLES = ["Dealer Staff", "Dealer Manager", "EVM Staff", "Admin"];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ROLES, default: "Dealer Staff" },
    dealer: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Dealer",
      required: function() {
        return this.role === "Dealer Staff" || this.role === "Dealer Manager";
      }
    },
  },
  { timestamps: true }
);

// hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// compare password method
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
module.exports.ROLES = ROLES;
