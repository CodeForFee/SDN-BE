const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    dealer: { type: mongoose.Schema.Types.ObjectId, ref: 'Dealer' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, required: true },
    status: { type: String, enum: ['new', 'in_progress', 'resolved'], default: 'new' },
    forwardedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Dealer Manager
    forwardedAt: { type: Date },
    forwardedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    forwardedNote: String,
    logs: [
      {
        at: Date,
        by: String,
        action: String,
        note: String,
      }
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema);


