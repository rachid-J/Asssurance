const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  assuranceCase: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AssuranceCase',
    required: true
  },
  installmentNumber: {
    type: Number,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  paymentDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Pending', 'Paid', 'Overdue'],
    default: 'Pending'
  },
  paymentMethod: {
    type: String
  },
  reference: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on document update
paymentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Check if payment is overdue
paymentSchema.pre('save', function(next) {
  if (this.status === 'Pending' && this.dueDate < new Date()) {
    this.status = 'Overdue';
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);