const mongoose = require('mongoose');

const assuranceCaseSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  policy: {
    type: String,
    required: true,
    unique: true
  },
  nature: {
    type: String,
    required: true,
    enum: ['A', 'N']
  },
  usage: {
    type: String,
    required: true
  },
  primeHT: {
    type: Number,
    required: true
  },
  primeTTC: {
    type: Number,
    required: true
  },
  comment: {
    type: String
  },
  status: {
    type: String,
    enum: ['Active', 'Pending', 'Expired'],
    default: 'Active'
  },
  advances: [{
    date: {
      type: Date,
      required: true
    },
    amount: {
      type: Number,
      required: true
    }
  }],
  balance: {
    type: Number,
    required: true
  },
  paymentMethod: {
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
assuranceCaseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Generate policy number
assuranceCaseSchema.pre('save', async function(next) {
  if (!this.policy) {
    const currentYear = new Date().getFullYear();
    const lastCase = await this.constructor.findOne({}, {}, { sort: { 'policy': -1 } });
    let nextNumber = 1;
    
    if (lastCase && lastCase.policy) {
      const lastNumber = parseInt(lastCase.policy.split('-')[1]);
      nextNumber = lastNumber + 1;
    }
    
    this.policy = `POL-${currentYear}${nextNumber.toString().padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('AssuranceCase', assuranceCaseSchema);