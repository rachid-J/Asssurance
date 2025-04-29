const mongoose = require('mongoose');

const insuranceSchema = new mongoose.Schema({
    policyNumber: {  // Kept original field name as requested
        type: String,
        required: true,
     
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: true
    },
    insuranceType: {
        type: String,
        required: true
    },
    createdby:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
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
        enum: ['active', 'expired', 'canceled','termination'],
        default: 'active'
    }
}, { timestamps: true });

// Auto-update status based on endDate
insuranceSchema.pre('save', function (next) {
    if (this.status !== 'canceled' && (this.isModified('endDate') || this.isNew)) {
        const now = new Date();
        this.status = this.endDate < now ? 'expired' : 'active';
    }
    next();
});

// Auto-update status based on endDate
insuranceSchema.pre('save', function(next) {
    if (this.status !== 'canceled' && (this.isModified('endDate') || this.isNew)) {
        const now = new Date();
        this.status = this.endDate < now ? 'expired' : 'active';
    }
    next();
});

// Indexes for efficient queries
insuranceSchema.index({ startDate: -1 });
insuranceSchema.index({ policyNumber: 'text' });
insuranceSchema.index({ createdby: 1 }); // Index for filtering by creator

module.exports = mongoose.model('Insurance', insuranceSchema);