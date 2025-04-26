const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    enum: ['Mr', 'Mme'],
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  telephone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please fill a valid email address']
  },
  
  // Identity Information
  idType: {
    type: String,
    enum: ['CIN', 'Passport', 'Carte de séjour'],
    default: 'CIN'
  },
  idNumber: {
    type: String,
    required: true,
    trim: true
  },
  numCarte: {
    type: String,
    trim: true,
    unique: true
  },
  
  // Personal Information
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['Masculin', 'Féminin'],
    required: true
  },
  maritalStatus: {
    type: String,
    enum: ['Célibataire', 'Marié', 'Divorcé', 'Veuf'],
    default: 'Célibataire'
  },
  numberOfChildren: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Address Information
  address: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  postalCode: {
    type: String,
    trim: true
  },
  
  // Professional Information
  profession: {
    type: String,
    trim: true
  },
  
  // Driver Information
  isDriver: {
    type: Boolean,
    default: true
  },
  
  // License Information
  licenseCategory: {
    type: String,
    trim: true
  },
  licenseNumber: {
    type: String,
    trim: true
  },
  licenseCountry: {
    type: String,
    trim: true
  },
  licenseIssueDate: {
    type: Date
  },
  
  // Client Type
  clientType: {
    type: String,
    enum: ['Particulier', 'Professionnel', 'Entreprise'],
    default: 'Particulier'
  },
  
  // System fields
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

clientSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create virtual for full name
clientSchema.virtual('fullName').get(function() {
  return `${this.title} ${this.firstName} ${this.name}`;
});

// Create indexes for better performance
clientSchema.index({ name: 1, firstName: 1 });
clientSchema.index({ telephone: 1 });
clientSchema.index({ idNumber: 1 });
clientSchema.index({ name: 'text', firstName: 'text' });

module.exports = mongoose.model('Client', clientSchema);