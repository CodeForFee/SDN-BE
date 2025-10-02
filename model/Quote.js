const mongoose = require("mongoose");

const quoteSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    dealer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dealer",
      required: true,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },
    quotedPrice: { type: Number, required: true },
    validUntil: Date,
    status: {
      type: String,
      enum: ["Active", "Accepted", "Expired", "Rejected"],
      default: "Active",
    },
    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quote", quoteSchema);
