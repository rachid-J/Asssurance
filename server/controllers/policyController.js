const Policy = require('../models/Policy');
const Payment = require('../models/Payment');


// Helper function to build search query
const buildSearchQuery = (searchTerm) => {
  if (!searchTerm) return {};
  return {
    $or: [
      { clientName: new RegExp(searchTerm, 'i') },
      { policyNumber: new RegExp(searchTerm, 'i') },
      { comment: new RegExp(searchTerm, 'i') }
    ]
  };
};

// Helper function to build date filter
const buildDateFilter = (startDate, endDate) => {
  if (!startDate || !endDate) return {};
  return {
    startDate: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  };
};

const getPolicies = async (req, res) => {
  try {
    const { search, startDate, endDate, period } = req.query;
    
    // Build base query
    let query = buildSearchQuery(search);
    
    // Handle period filter
    if (period && period !== 'all') {
      const days = parseInt(period);
      const start = new Date();
      start.setDate(start.getDate() - days);
      query.startDate = { $gte: start };
    }
    
    // Handle custom date range
    if (startDate && endDate) {
      query.startDate = buildDateFilter(startDate, endDate);
    }

    const policies = await Policy.find(query)
      .sort({ startDate: -1 })
      .lean();

    // Get payment status for each policy
    const policiesWithPaymentStatus = await Promise.all(
      policies.map(async (policy) => {
        const payments = await Payment.find({ policy: policy._id });
        const paidAmount = payments
          .filter(p => p.paymentDate)
          .reduce((sum, p) => sum + p.amount, 0);
    
        // Calculate based on actual advances or policy total
        const totalAmount = payments.length > 0 
          ? payments.reduce((sum, p) => sum + p.amount, 0)
          : policy.primeTTC;
    
        return {
          ...policy,
          paymentStatus: {
            totalAdvances: payments.length,
            paidAdvances: payments.filter(p => p.paymentDate).length,
            paidAmount,
            remainingAmount: totalAmount - paidAmount,
            paymentPercentage: (paidAmount / totalAmount) * 100 || 0
          }
        };
      })
    );

    res.json(policiesWithPaymentStatus);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const createPolicy = async (req, res) => {
  try {
    const { primeTTC, primeHT, ...policyData } = req.body;
    
    // Validate prime values
    if (isNaN(primeTTC) || isNaN(primeHT)) {
      return res.status(400).json({ message: 'Invalid amount values' });
    }

    // Create policy without any advances
    const policy = new Policy({
      ...policyData,
      primeTTC: parseFloat(primeTTC),
      primeHT: parseFloat(primeHT)
    });
    
    const savedPolicy = await policy.save();
    res.status(201).json(savedPolicy);

  } catch (error) {
    console.error('Policy creation error:', error);
    res.status(400).json({ message: 'Error creating policy', error: error.message });
  }
};

const updatePolicy = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id);
    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' });
    }

    // Prevent primeTTC modification if advances exist
    if (req.body.primeTTC) {
      const payments = await Payment.find({ policy: policy._id });
      if (payments.length > 0) {
        return res.status(400).json({ 
          message: 'Cannot modify policy amount after creating advances'
        });
      }
    }

    const updatedPolicy = await Policy.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json(updatedPolicy);
  } catch (error) {
    res.status(400).json({ message: 'Error updating policy', error: error.message });
  }
};

const deletePolicy = async (req, res) => {
  try {
    const policy = await Policy.findByIdAndDelete(req.params.id);
    
    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' });
    }

    // Delete associated payments
    await Payment.deleteMany({ policy: policy._id });
    
    res.json({ message: 'Policy deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting policy', error: error.message });
  }
};

const getPolicyTotals = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchStage = {};
    if (startDate && endDate) {
      matchStage.startDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const aggregation = await Policy.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalHT: { $sum: "$primeHT" },
          totalTTC: { $sum: "$primeTTC" }
        }
      }
    ]);

    const result = aggregation[0] || { count: 0, totalHT: 0, totalTTC: 0 };
    res.json({
      count: result.count,
      primeHT: result.totalHT,
      primeTTC: result.totalTTC
    });
  } catch (error) {
    res.status(500).json({ message: 'Error calculating totals', error: error.message });
  }
};

module.exports = {
  getPolicies,
  createPolicy,
  updatePolicy,
  deletePolicy,
  getPolicyTotals
};