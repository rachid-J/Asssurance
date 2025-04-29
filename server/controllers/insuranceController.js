const Payment = require('../models/Payment');
const Client = require('../models/Client');
const Vehicle = require('../models/Vehicle');
const Insurance = require('../models/Insurance');




// Helper function to build date filter
const buildDateFilter = (startDate, endDate) => ({
  $gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
  $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
});

const getInsurances = async (req, res) => {
  try {
    const { search, startDate, endDate, period, createdby } = req.query;
    let query = {};

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

    // Add createdby filter if provided
    if (createdby) {
      query.createdby = createdby;
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
      .populate('client', 'title name firstName')
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
    const { vehicle, client, ...insuranceData } = req.body;

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

    // Create insurance with corrected field name
    const insurance = new Insurance({
      ...insuranceData,
      client: clientObj._id,
      vehicle: vehicleObj._id,
      usage: vehicleObj.usage,
      createdby: req.user._id  // Corrected field name
    });

    // Save and update relationships
    const savedInsurance = await insurance.save();
    
    await Promise.all([
      Client.findByIdAndUpdate(client, 
        { $addToSet: { insurances: savedInsurance._id } },
        { new: true }
      ),
      Vehicle.findByIdAndUpdate(vehicle,
        { $addToSet: { insuranceId: savedInsurance._id } },
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
    const insurance = await Insurance.findByIdAndDelete(req.params.id);
    
    if (!insurance) {
      return res.status(404).json({ message: 'Insurance not found' });
    }

    await Payment.deleteMany({ insurance: insurance._id });
    
    res.json({ message: 'Insurance deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting insurance', error: error.message });
  }
};

const getInsuranceTotals = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchStage = {};
    if (startDate && endDate) {
      matchStage.startDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const aggregation = await Insurance.aggregate([
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

const getInsuranceById = async (req, res) => {
  try {
    const insurance = await Insurance.findById(req.params.id)
      .populate('client', 'title name firstName')
      .populate('vehicle', 'make model registrationNumber usage')
      .lean();
    console.log(insurance)
    if (!insurance) {
      return res.status(404).json({ message: 'Insurance not found' });
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
    const stats = await Insurance.aggregate([
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

const renewInsurance = async (req, res) => {
  try {
    const insurance = await Insurance.findById(req.params.id);
    if (!insurance) return res.status(404).json({ message: 'Insurance not found' });
    
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

const cancelInsurance = async (req, res) => {
  try {
    const insurance = await Insurance.findByIdAndUpdate(
      req.params.id,
      { status: 'Canceled' },
      { new: true }
    );
    
    if (!insurance) return res.status(404).json({ message: 'Insurance not found' });
    
    res.json(insurance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const changeInsuranceTypeToResel = async (req, res) => {
  try {
    const insuranceId = req.params.id;
    
    // Validate user authentication
    if (!req.user?._id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Find the insurance policy
    const insurance = await Insurance.findById(insuranceId);
    
    if (!insurance) {
      return res.status(404).json({ message: 'Insurance not found' });
    }
    
    // Check if the insurance is already of type "resel"
    if (insurance.insuranceType === 'resel') {
      return res.status(400).json({ 
        message: 'Insurance is already of type resel',
        insurance
      });
    }
    
    // Store the previous type for logging
    const previousType = insurance.insuranceType;
    
    // Update the insurance type to "resel"
    const updatedInsurance = await Insurance.findByIdAndUpdate(
      insuranceId,
      { 
        insuranceType: 'resel',
        updatedBy: req.user._id // Track who made the change if you have this field
      },
      { new: true, runValidators: true }
    )
    .populate('client', 'title name firstName')
    .populate('vehicle', 'make model registrationNumber');
    
    console.log(`Insurance ${insuranceId} type changed from ${previousType} to resel by user ${req.user._id}`);
    
    res.json({
      success: true,
      message: 'Insurance type updated to resel successfully',
      insurance: {
        ...updatedInsurance.toObject(),
        clientName: updatedInsurance.client ? 
          `${updatedInsurance.client.title} ${updatedInsurance.client.firstName} ${updatedInsurance.client.name}` : '',
        vehicleInfo: updatedInsurance.vehicle ?
          `${updatedInsurance.vehicle.make} ${updatedInsurance.vehicle.model} (${updatedInsurance.vehicle.registrationNumber})` : ''
      }
    });
  } catch (error) {
    console.error('Error changing insurance type:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error changing insurance type', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
};

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
  changeInsuranceTypeToResel
};
