const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['contract', 'id', 'vehicle', 'inspection', 'proof', 'other']
  },
  insurance: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Insurance',
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

documentSchema.index({ insurance: 1 });
documentSchema.index({ name: 'text' });

module.exports = mongoose.model('Document', documentSchema);