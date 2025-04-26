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
  primeActuel: {
    type: Number,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'canceled'],
    default: 'active'
  }
}, { timestamps: true });

// Add pre-save hook to auto-update status
policySchema.pre('save', function(next) {
  if (this.status !== 'canceled' && (this.isModified('endDate') || this.isNew)) {
    const now = new Date();
    this.status = this.endDate < now ? 'expired' : 'active';
  }
  next();
});
// Indexes

policySchema.index({ startDate: -1 });
policySchema.index({ clientName: 'text' });

module.exports = mongoose.model('Policy', policySchema);