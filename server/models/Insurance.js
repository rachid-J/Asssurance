const mongoose = require('mongoose');
const { scheduleJob } = require('node-schedule');


const insuranceSchema = new mongoose.Schema({
    policyNumber: {
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
        enum: ['Active', 'Termination', 'Canceled', 'Expired'],
        default: 'Active'
    }
}, { timestamps: true });

// Auto-update status based on endDate
insuranceSchema.pre('save', async function(next) {
    if (this.insuranceType === 'Renouvellement' && !this.originalPolicy) {
        const latestPolicy = await mongoose.model('Insurance').findOne({
            vehicle: this.vehicle,
            policyNumber: this.policyNumber
        }).sort({ endDate: -1 });
        
        if (latestPolicy) {
            this.renewalCount = latestPolicy.renewalCount + 1;
        }
    }
    
    // Status update logic
    if (this.status !== 'Canceled' && (this.isModified('endDate') || this.isNew)) {
        const now = new Date();
        this.status = this.endDate < now ? 'Expired' : 'Active';
    }
    next();
});

// Daily status update job remains the same
scheduleJob('* * * * *', async ()  => {
    await mongoose.model('Insurance').updateMany(
        { 
            status: 'Active',
            endDate: { $lt: new Date() }
        },
        { $set: { status: 'Expired' } }
    );
    console.log('Updated expired policies');
});


// Indexes for efficient queries
insuranceSchema.index({ startDate: -1 });
insuranceSchema.index({ createdby: 1 }); // Index for filtering by creator
insuranceSchema.index({ status: 1, endDate: 1 });

module.exports = mongoose.model('Insurance', insuranceSchema);