const Policy = require('../models/Policy');
const Payment = require('../models/Payment');
const Client = require('../models/Client');
const Vehicle = require('../models/Vehicle');


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
const buildDateFilter = (startDate, endDate) => ({
  // Directly return comparison operators
  $gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
  $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
});

const getPolicies = async (req, res) => {
  try {
    const { search, startDate, endDate, period } = req.query;
    let query = {};

    // Build date query correctly
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

    const policies = await Policy.find(query)
      .sort({ startDate: -1 })
      .populate('client', 'title name firstName')
      .lean();

    // Get payment status for each policy
    const policiesWithPaymentStatus = await Promise.all(
      policies.map(async (policy) => {
        const payments = await Payment.find({ policy: policy._id });
        const paidAmount = payments
          .filter(p => p.paymentDate)
          .reduce((sum, p) => sum + p.amount, 0);

        // CORRECTED CALCULATION
        const totalAmount = policy.primeActuel;
        const remainingAmount = Math.max(totalAmount - paidAmount, 0);
        const enhancedPolicy = {
          ...policy,
          clientName: policy.client ? 
            `${policy.client.title} ${policy.client.firstName} ${policy.client.name}` : '',
          vehicleInfo: policy.vehicle ?
            `${policy.vehicle.make} ${policy.vehicle.model} (${policy.vehicle.registrationNumber})` : ''
        };
        return {
          ...enhancedPolicy,
          paymentStatus: {
            totalAdvances: Math.max(payments.length, 4), // Default to 4
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

    res.json(policiesWithPaymentStatus);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const createPolicy = async (req, res) => {
  try {
    const { vehicle, client, ...policyData } = req.body;

    // Validate required fields
    if (!vehicle || !client) {
      return res.status(400).json({ message: 'Missing client or vehicle ID' });
    }

    const [clientObj, vehicleObj] = await Promise.all([
      Client.findById(client),
      Vehicle.findById(vehicle)
    ]);

    if (!clientObj) return res.status(404).json({ message: 'Client not found' });
    if (!vehicleObj) return res.status(404).json({ message: 'Vehicle not found' });

    const policy = new Policy({
      ...policyData,
      client: clientObj._id,
      vehicle: vehicleObj._id,
      usage: vehicleObj.usage
    });

    const savedPolicy = await policy.save();

    // Update relationships
    await Promise.all([
      Client.findByIdAndUpdate(clientObj._id, 
        { $push: { policies: savedPolicy._id } }
      ),
      Vehicle.findByIdAndUpdate(vehicleObj._id,
        { $push: { policyId: savedPolicy._id } }
      ),

    ]);

    res.status(201).json(savedPolicy);
  } catch (error) {
    console.error('Policy creation error:', error);
    res.status(500).json({ 
      message: 'Server error creating policy',
      error: error.message 
    });
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
const getPolicyById = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id)
      .populate('client', 'title name firstName')
      .populate('vehicle', 'make model registrationNumber usage')
      .lean();

    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' });
    }
    
    // Add virtual fields
    const enhancedPolicy = {
      ...policy,
      clientName: policy.client ? 
        `${policy.client.title} ${policy.client.firstName} ${policy.client.name}` : '',
      vehicleInfo: policy.vehicle ?
        `${policy.vehicle.make} ${policy.vehicle.model} (${policy.vehicle.registrationNumber})` : ''
    };

    res.json(enhancedPolicy);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
const getPolicyStats = async (req, res) => {
  try {
    const stats = await Policy.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalPrime: { $sum: '$primeTTC' }
        }
      }
    ]);
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const renewPolicy = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id);
    if (!policy) return res.status(404).json({ message: 'Policy not found' });
    
    // Implement your renewal logic here
    const renewedPolicy = await Policy.findByIdAndUpdate(
      req.params.id,
      { status: 'Active', endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)) },
      { new: true }
    );
    
    res.json(renewedPolicy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const cancelPolicy = async (req, res) => {
  try {
    const policy = await Policy.findByIdAndUpdate(
      req.params.id,
      { status: 'Canceled' },
      { new: true }
    );
    
    if (!policy) return res.status(404).json({ message: 'Policy not found' });
    
    res.json(policy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {

  getPolicies,
  createPolicy,
  updatePolicy,
  deletePolicy,
  getPolicyTotals,
  getPolicyById,
  getPolicyStats,
  renewPolicy,
  cancelPolicy
};