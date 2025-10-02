const mongoose = require("mongoose");

const dealerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: String,
    contactInfo: String,
    salesTarget: Number,
    debt: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Dealer", dealerSchema);
