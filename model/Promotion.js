const mongoose = require("mongoose");

const promotionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    discountPercent: Number,
    startDate: Date,
    endDate: Date,
    dealer: { type: mongoose.Schema.Types.ObjectId, ref: "Dealer" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Promotion", promotionSchema);
