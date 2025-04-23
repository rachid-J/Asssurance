const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  assuranceCase: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AssuranceCase',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  comment: {
    type: String
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
});

// Update lastModified on document update
documentSchema.pre('save', function(next) {
  this.lastModified = Date.now();
  next();
});

module.exports = mongoose.model('Document', documentSchema);