const mongoose = require('mongoose');

// Document Schema remains unchanged
const documentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Registration', 'Technical Inspection', 'Insurance', 'Other'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  file: {
    path: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    }
  },
  issueDate: {
    type: Date,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  issuingAuthority: {
    type: String
  },
  notes: {
    type: String
  }
}, { _id: true });

// Updated Vehicle Schema
const vehicleSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  insuranceId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Insurance', 
    required: true // Changed to false to allow null
  },
  createdby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // All vehicle information fields remain unchanged
  make: {
    type: String,
    required: true,
    trim: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  yearOfManufacture: {
    type: Number,
    required: true
  },
  registrationNumber: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  vinNumber: {
    type: String,
    trim: true
  },
  vehicleType: {
    type: String,
    enum: ['Car', 'Motorcycle', 'Truck', 'Van', 'Other'],
    default: 'Car'
  },
  fuelType: {
    type: String,
    enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'LPG', 'Other'],
    default: 'Petrol'
  },
  usage: {
    type: String,
    enum: ['Personal', 'Professional', 'Commercial', 'Mixed'],
    default: 'Personal'
  },
  engineSize: {
    type: Number,
    min: 0
  },
  horsePower: {
    type: Number,
    min: 0
  },
  numberOfSeats: {
    type: Number,
    min: 0
  },
  weight: {
    type: Number,
    min: 0
  },
  documents: [documentSchema],
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Indexes updated with new field name
vehicleSchema.index({ make: 'text', model: 'text', registrationNumber: 'text' });
vehicleSchema.index({ clientId: 1 });
vehicleSchema.index({ registrationNumber: 1 });
vehicleSchema.index({ insuranceId: 1 });  // New index for insurance references

module.exports = mongoose.model('Vehicle', vehicleSchema);