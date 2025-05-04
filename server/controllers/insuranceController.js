const Payment = require('../models/Payment');
const Client = require('../models/Client');
const Vehicle = require('../models/Vehicle');
const Insurance = require('../models/Insurance');
const User = require('../models/User');

// Helper function to build date filter
const buildDateFilter = (startDate, endDate) => ({
  $gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
  $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
});

const getInsurances = async (req, res) => {
  try {
    const { search, startDate, endDate, period, createdby } = req.query;
    let query = {};

    // If user is not admin, filter by current user ID
    if (req.user.role !== 'admin' && !createdby) {
      query.createdby = req.user._id;
    } else if (createdby) {

      query.createdby = createdby;
    }

    // Add search filter if provided
    if (search && search.trim() !== '') {
      // Create a text search across multiple fields
      query.$or = [
        { policyNumber: { $regex: search, $options: 'i' } },
        { 'client.name': { $regex: search, $options: 'i' } },
        { 'client.firstName': { $regex: search, $options: 'i' } },
        { insuranceType: { $regex: search, $options: 'i' } }
      ];
    }

    if (period && period !== 'all') {
      const days = parseInt(period);
      const start = new Date();
      start.setDate(start.getDate() - days);
      start.setHours(0, 0, 0, 0);
      query.startDate = { $gte: start };
    }

    if (startDate && endDate) {
      query.startDate = buildDateFilter(startDate, endDate);
    }

    // First get the clients to search against their names
    const clients = await Client.find({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } }
      ]
    }).select('_id');
    
    // If we found any matching clients, add them to our query
    if (search && clients.length > 0) {
      if (!query.$or) query.$or = [];
      query.$or.push({ client: { $in: clients.map(c => c._id) } });
    }

    const insurances = await Insurance.find(query)
      .sort({ startDate: -1 })
      .populate('client', 'title name firstName telephone email')
      .populate('createdby', 'name firstName') 
      .lean();

    const insurancesWithPaymentStatus = await Promise.all(
      insurances.map(async (insurance) => {
        const payments = await Payment.find({ insurance: insurance._id });
        const paidAmount = payments
          .filter(p => p.paymentDate)
          .reduce((sum, p) => sum + p.amount, 0);

        const totalAmount = insurance.primeActuel;
        const remainingAmount = Math.max(totalAmount - paidAmount, 0);
        const enhancedInsurance = {
          ...insurance,
          clientName: insurance.client ? 
            `${insurance.client.title} ${insurance.client.firstName} ${insurance.client.name}` : '',
          vehicleInfo: insurance.vehicle ?
            `${insurance.vehicle.make} ${insurance.vehicle.model} (${insurance.vehicle.registrationNumber})` : '',
          createdByName: insurance.createdby ?
            `${insurance.createdby.firstName} ${insurance.createdby.name}` : ''
        };
        return {
          ...enhancedInsurance,
          paymentStatus: {
            totalAdvances: Math.max(payments.length, 4),
            paidAdvances: payments.filter(p => p.paymentDate).length,
            paidAmount,
            totalAmount,
            remainingAmount,
            paymentPercentage: totalAmount > 0 
              ? Math.min((paidAmount / totalAmount) * 100, 100)
              : 0
          }
        };
      })
    );

    res.json(insurancesWithPaymentStatus);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// controllers/insuranceController.js
const createInsurance = async (req, res) => {
  try {
    const { vehicle, client, insuranceType, ...insuranceData } = req.body;

    // Validate user authentication
    if (!req.user?._id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Validate input
    if (!vehicle || !client) {
      return res.status(400).json({ message: 'Missing client or vehicle ID' });
    }

    const [clientObj, vehicleObj] = await Promise.all([
      Client.findById(client),
      Vehicle.findById(vehicle)
    ]);

    // Handle validation errors
    if (!clientObj) return res.status(404).json({ message: 'Client not found' });
    if (!vehicleObj) return res.status(404).json({ message: 'Vehicle not found' });

    // Handle policy number for renewals
   // server/controllers/insuranceController.js
if (insuranceType === 'Renouvellement') {
  const latestExpired = await Insurance.findOne({
    vehicle: vehicleObj._id,
    status: 'Expired'
  }).sort({ endDate: -1 });

  if (!latestExpired) {
    return res.status(400).json({ 
      message: 'Cannot renew - no expired insurance found for this vehicle',
      code: 'NO_EXPIRED_POLICY'
    });
  }

  // Check for existing active renewal
  const existingActive = await Insurance.findOne({
    policyNumber: latestExpired.policyNumber,
    status: 'Active'
  });

  if (existingActive) {
    return res.status(400).json({
      message: 'Active renewal already exists for this policy',
      code: 'ACTIVE_RENEWAL_EXISTS'
    });
  }

  insuranceData.policyNumber = latestExpired.policyNumber;
}

   
    // Create insurance
    const insurance = new Insurance({
      ...insuranceData,
      insuranceType,
      client: clientObj._id,
      vehicle: vehicleObj._id,
      usage: vehicleObj.usage,
      createdby: req.user._id
    });

    // Save insurance
    const savedInsurance = await insurance.save();
    
    // Update relationships (corrected vehicle update)
    await Promise.all([
      Client.findByIdAndUpdate(client, 
        { $addToSet: { insurances: savedInsurance._id } },
        { new: true }
      ),
      Vehicle.findByIdAndUpdate(vehicle,
        { $set: { insuranceId: savedInsurance._id } }, // Corrected to set single reference
        { new: true }
      )
    ]);

    res.status(201).json(savedInsurance);
  } catch (error) {
    console.error('Insurance creation error:', error);
    res.status(500).json({ 
      message: 'Server error creating insurance',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const updateInsurance = async (req, res) => {
  try {
    const insurance = await Insurance.findById(req.params.id);
    if (!insurance) {
      return res.status(404).json({ message: 'Insurance not found' });
    }
 

    // Check if user has permission to update this insurance
    if (req.user.role !== 'admin' && insurance.createdby.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You can only update insurances you created.' });
    }

    if (req.body.primeTTC) {
      const payments = await Payment.find({ insurance: insurance._id });
      if (payments.length > 0) {
        return res.status(400).json({ 
          message: 'Cannot modify insurance amount after creating advances'
        });
      }
    }

    const updatedInsurance = await Insurance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json(updatedInsurance);
  } catch (error) {
    res.status(400).json({ message: 'Error updating insurance', error: error.message });
  }
};

const deleteInsurance = async (req, res) => {
  try {
    const insurance = await Insurance.findById(req.params.id);
    
    if (!insurance) {
      return res.status(404).json({ message: 'Insurance not found' });
    }

    // Check if user has permission to delete this insurance
    if (req.user.role !== 'admin' && insurance.createdby.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You can only delete insurances you created.' });
    }

    await Insurance.findByIdAndDelete(req.params.id);
    await Payment.deleteMany({ insurance: insurance._id });
    
    res.json({ message: 'Insurance deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting insurance', error: error.message });
  }
};

const getInsuranceTotals = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build the match stage with date filters
    const matchStage = {
      // Exclude canceled insurance policies
      status: { $ne: 'Canceled' }
    };
    
    if (startDate && endDate) {
      matchStage.startDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Add createdby filter for non-admin users
    if (req.user.role !== 'admin') {
      matchStage.createdby = req.user._id;
    } else if (req.query.createdby) {
      matchStage.createdby = req.query.createdby;
    }

    const aggregation = await Insurance.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalTTC: { $sum: "$primeTTC" }
        }
      }
    ]);

    const result = aggregation[0] || { count: 0, totalTTC: 0 };
    res.json({
      count: result.count,
      primeTTC: result.totalTTC
    });
  } catch (error) {
    res.status(500).json({ message: 'Error calculating totals', error: error.message });
  }
};

const getInsuranceById = async (req, res) => {
  try {
    const insurance = await Insurance.findById(req.params.id)
      .populate('client', 'title name firstName telephone email')
      .populate('vehicle', 'make model registrationNumber usage')
      .lean();
      
    if (!insurance) {
      return res.status(404).json({ message: 'Insurance not found' });
    }
    console.log('req.user.role:', req.user.role);
    console.log('insurance.createdby:', insurance.createdby.toString());
    console.log('req.user._id:', req.user._id.toString());
    if (req.user.role !== 'admin' && insurance.createdby.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You can only view insurances you created.' });
    }
    
    const enhancedInsurance = {
      ...insurance,
      clientName: insurance.client ? 
        `${insurance.client.title} ${insurance.client.firstName} ${insurance.client.name}` : '',
      vehicleInfo: insurance.vehicle ?
        `${insurance.vehicle.make} ${insurance.vehicle.model} (${insurance.vehicle.registrationNumber})` : ''
    };

    res.json(enhancedInsurance);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};


const getInsuranceStats = async (req, res) => {
  try {
    const matchStage = {};
    
    // Add createdby filter for non-admin users
    if (req.user.role !== 'admin') {
      matchStage.createdby = req.user._id;
    } else if (req.query.createdby) {
      matchStage.createdby = req.query.createdby;
    }
    
    const pipeline = [];
    
    // Only add match stage if there are conditions
    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }
    
    pipeline.push({
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalPrime: { $sum: '$primeTTC' }
      }
    });
    
    const stats = await Insurance.aggregate(pipeline);
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const renewInsurance = async (req, res) => {
  try {
    const insurance = await Insurance.findById(req.params.id);
    
    if (!insurance) {
      return res.status(404).json({ message: 'Insurance not found' });
    }
    
    // Check if user has permission to renew this insurance
    if (req.user.role !== 'admin' && insurance.createdby.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You can only renew insurances you created.' });
    }
    
    const renewedInsurance = await Insurance.findByIdAndUpdate(
      req.params.id,
      { status: 'Active', endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)) },
      { new: true }
    );
    
    res.json(renewedInsurance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add this updated cancelInsurance function to your controller

const cancelInsurance = async (req, res) => {
  try {
    const insuranceId = req.params.id;
    const refundData = req.body; // Contains refundAmount, refundMethod, cancelReason, penaltyPercentage, fullRefund
    
    // Validate user authentication
    if (!req.user?._id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Find the insurance policy
    const insurance = await Insurance.findById(insuranceId);
    
    if (!insurance) {
      return res.status(404).json({ message: 'Insurance not found' });
    }
    
    // Check if user has permission to cancel this insurance
    if (req.user.role !== 'admin' && insurance.createdby.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You can only cancel insurances you created.' });
    }
    
    // Check if insurance is already canceled
    if (insurance.status === 'Canceled') {
      return res.status(400).json({
        message: 'Insurance is already canceled',
        insurance
      });
    }
    
    // Get total payments made for this insurance
    const payments = await Payment.find({ insurance: insuranceId });
    const totalPaid = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    
    // Handle refunds
    let refunds = [];
    const isFullRefund = refundData?.fullRefund === true;
    
    if (isFullRefund && totalPaid > 0) {
      // Full refund - create refund entries for each payment
      for (const payment of payments) {
        if (payment.amount > 0) { // Only refund positive payments (not previous refunds)
          const refund = await Payment.create({
            insurance: insuranceId,
            advanceNumber: payment.advanceNumber, // Keep same advance number for tracking
            paymentDate: new Date(),
            amount: -Math.abs(payment.amount), // Negative amount for refund
            paymentMethod: refundData.refundMethod || payment.paymentMethod || 'cash',
            reference: `Refund of payment #${payment.advanceNumber}`,
            notes: `Full refund: ${refundData.cancelReason || 'Insurance canceled'} (Penalty: ${refundData.penaltyPercentage || 0}%)`
          });
          refunds.push(refund);
        }
      }
    } else if (refundData && totalPaid > 0 && refundData.refundAmount > 0) {
      // Partial refund - create a single refund record
      const refund = await Payment.create({
        insurance: insuranceId,
        advanceNumber: payments.length + 1,
        paymentDate: new Date(),
        amount: -Math.abs(refundData.refundAmount), // Negative amount for refund
        paymentMethod: refundData.refundMethod || 'cash',
        reference: refundData.reference || '',
        notes: `Partial refund: ${refundData.cancelReason || 'Insurance canceled'} (Penalty: ${refundData.penaltyPercentage || 0}%)`
      });
      refunds.push(refund);
    }
    
    // Calculate net amount after all refunds
    const allPayments = await Payment.find({ insurance: insuranceId });
    const netAmount = allPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    
    // Update the insurance status to 'Canceled'
    const updatedInsurance = await Insurance.findByIdAndUpdate(
      insuranceId,
      {
        status: 'Canceled',
        canceledAt: new Date(),
        canceledBy: req.user._id,
        cancelReason: refundData?.cancelReason || '',
        ...(refundData ? { 
          refundDetails: {
            ...refundData,
            totalRefunded: isFullRefund ? totalPaid : (refundData.refundAmount || 0),
            isFullRefund
          } 
        } : {})
      },
      { new: true, runValidators: true }
    )
    .populate('client', 'title name firstName')
    .populate('vehicle', 'make model registrationNumber');
    
    res.json({
      success: true,
      message: isFullRefund ? 
        'Insurance canceled with full refund of all payments' : 
        'Insurance canceled successfully',
      insurance: {
        ...updatedInsurance.toObject(),
        clientName: updatedInsurance.client ? 
          `${updatedInsurance.client.title} ${updatedInsurance.client.firstName} ${updatedInsurance.client.name}` : '',
        vehicleInfo: updatedInsurance.vehicle ?
          `${updatedInsurance.vehicle.make} ${updatedInsurance.vehicle.model} (${updatedInsurance.vehicle.registrationNumber})` : '',
        netAmount: netAmount // Add net amount after refunds
      },
      refunds: refunds
    });
  } catch (error) {
    console.error('Error canceling insurance:', error);
    res.status(500).json({
      success: false,
      message: 'Error canceling insurance',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
};


// controllers/insuranceController.js
const changeInsuranceTypeToResel = async (req, res) => {
  try {
    const insuranceId = req.params.id;
    const refundData = req.body;

    // Add authentication check
    if (!req.user?._id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // First check if insurance exists
    const insurance = await Insurance.findById(insuranceId);
    if (!insurance) {
      return res.status(404).json({ 
        success: false,
        message: 'Insurance not found' 
      });
    }
    
    // Check if user has permission to change this insurance type
    if (req.user.role !== 'admin' && insurance.createdby.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. You can only modify insurances you created.' 
      });
    }

    // 2. Update insurance status
    const updatedInsurance = await Insurance.findByIdAndUpdate(
      insuranceId,
      { 
        status: 'Termination', 
        updatedBy: req.user._id,
        terminationDate: new Date() // Add termination date
      },
      { new: true, runValidators: true } // Add validation
    );

    // Process refund if applicable
    if (refundData && refundData.refundAmount) {
      if (typeof refundData.refundAmount !== 'number' || refundData.refundAmount <= 0) {
        return res.status(400).json({ 
          success: false,
          message: 'Invalid refund amount' 
        });
      }
      
      // Get total payments
      const payments = await Payment.find({ insurance: insuranceId });
      const totalPaid = payments.reduce((sum, payment) => sum + (payment.amount > 0 ? payment.amount : 0), 0);
      
      if (refundData.refundAmount > totalPaid) {
        return res.status(400).json({
          success: false,
          message: `Refund amount exceeds total paid amount (${totalPaid})`
        });
      }
    }

    res.json({ 
      success: true,
      insurance: updatedInsurance 
    });
  } catch (error) {
    console.error('Error changing insurance type:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};


// In your processRefund controller
// Add this to your controller
const processRefund = async (req, res) => {
  try {
    const {id : insuranceId } = req.params;
    const { refundAmount, refundMethod, refundReason } = req.body;
    console.log("refundAmount",refundAmount)
    console.log("refundMethod",refundMethod)
    console.log("refundReason",refundReason)
    // Validation
    if (!refundAmount || refundAmount <= 0) {
      return res.status(400).json({ message: 'Valid refund amount required' });
    }

    const insurance = await Insurance.findById(insuranceId);
    if (!insurance) return res.status(404).json({ message: 'Insurance not found' });

    // Check available balance
    const payments = await Payment.find({ insurance: insuranceId });
    const balance = payments.reduce((sum, p) => sum + p.amount, 0);
    if (balance < refundAmount) {
      return res.status(400).json({ message: 'Refund exceeds available balance' });
    }
    const lastPayment = await Payment.findOne({ insurance: insuranceId })
  .sort('-advanceNumber')
  .select('advanceNumber')
  .lean();

// Calculate next advance number for the refund (negative to indicate refund)
const nextAdvanceNumber = lastPayment 
  ? (Math.abs(lastPayment.advanceNumber) + 1)
  : -1;

    // Create refund
    const refund = await Payment.create({
      insurance: insuranceId,
      advanceNumber : nextAdvanceNumber,
      amount: -Math.abs(refundAmount),
      paymentMethod: refundMethod || 'cash',
      paymentDate: new Date(),
      notes: refundReason || 'Client requested refund',
      reference: `REFUND-${Date.now()}`
    });

    // Update insurance status
    const totalResult = await Payment.aggregate([
      { $match: { insurance: insuranceId } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    await Insurance.findByIdAndUpdate(insuranceId, {
      'paymentStatus.totalPaid': totalResult[0]?.total || 0,
      'paymentStatus.isPaidInFull': totalResult[0]?.total >= insurance.primeTTC,
      'paymentStatus.lastPaymentDate': new Date()
    });

    res.status(201).json(refund);
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({ 
      message: 'Refund processing failed',
      error: error.message 
    });
  }
};
const getLatestExpiredInsurance = async (req, res) => {
  try {
    const vehicleId = req.params.vehicleId;
    
    const insurance = await Insurance.findOne({
      vehicle: vehicleId,
      status: { $in: ['Expired', 'Canceled', 'Termination'] }
    })
    .sort({ endDate: -1 })
    .select('policyNumber');

    res.json(insurance || {});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Don't forget to export this function in the module.exports

module.exports = {
  getInsurances,
  createInsurance,
  updateInsurance,
  deleteInsurance,
  getInsuranceTotals,
  getInsuranceById,
  getInsuranceStats,
  renewInsurance,
  cancelInsurance,
  changeInsuranceTypeToResel,
  processRefund,
  getLatestExpiredInsurance
};