// models/Policy.js
const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
  policyNumber: {
    type: String,
    required: true,
    unique: true
  },
  clientId: {
    type: String,
    required: true
  },
  clientName: {
    type: String,
    required: true
  },
  insuranceType: {
    type: String,
    required: true
  },
  usage: {
    type: String,
    required: true
  },
  comment: String,
  primeHT: {
    type: Number,
    required: true
  },
  primeTTC: {
    type: Number,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  }
}, { timestamps: true });

// Indexes
policySchema.index({ policyNumber: 1 }, { unique: true });
policySchema.index({ startDate: -1 });
policySchema.index({ clientName: 'text' });

module.exports = mongoose.model('Policy', policySchema);