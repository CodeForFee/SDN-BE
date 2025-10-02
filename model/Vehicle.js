const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    model: { type: String, required: true },
    version: String,
    color: String,
    price: { type: Number, required: true },
    features: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vehicle", vehicleSchema);
