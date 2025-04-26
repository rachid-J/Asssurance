const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  
  // Vehicle Information
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
  
  // Vehicle Details
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
  
  // Technical Information
  engineSize: {
    type: Number,  // in cc
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
    type: Number,  // in kg
    min: 0
  },
  
  // Documents
  documents: [{
    type: {
      type: String,
      enum: ['Registration', 'Technical Inspection', 'Insurance', 'Other'],
      required: true
    },
    number: {
      type: String,
      required: true
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
    }
  }],
  
  // System fields
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Create text index for searching
vehicleSchema.index({ make: 'text', model: 'text', registrationNumber: 'text' });

// Regular indexes
vehicleSchema.index({ clientId: 1 });
vehicleSchema.index({ registrationNumber: 1 });

module.exports = mongoose.model('Vehicle', vehicleSchema);