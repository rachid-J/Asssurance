const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  insurance: {  // Changed from policy to insurance
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Insurance',  // Changed reference to Insurance
    required: true
  },
  advanceNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 5
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
},{ timestamps: true });

// Updated compound index for insurance references
paymentSchema.index({ insurance: 1, advanceNumber: 1 }, { unique: true });  // Changed policy to insurance

// Index for payment status queries remains valid
paymentSchema.index({ paymentDate: 1 });

module.exports = mongoose.model('Payment', paymentSchema);