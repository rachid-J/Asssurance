// models/Payment.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  policy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Policy',
    required: true
  },
  advanceNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 4
  },
  paymentDate: {
    type: Date,
    default: null
  },
  amount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'check', 'card']
  },
  reference: String,
  notes: String
});

// Compound index to ensure unique advances per policy
paymentSchema.index({ policy: 1, advanceNumber: 1 }, { unique: true });

// Index for payment status queries
paymentSchema.index({ paymentDate: 1 });

module.exports = mongoose.model('Payment', paymentSchema);