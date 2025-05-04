const Client = require('../models/Client');
const Document = require('../models/Document');
const Insurance = require('../models/Insurance');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');

// Get all clients with advanced search
// Updated getClients function for clientController.js
exports.getClients = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter query
    const filter = {};
    
    // Search filter (across multiple fields)
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { name: searchRegex },
        { firstName: searchRegex },
        { email: searchRegex },
        { telephone: searchRegex },
        { idNumber: searchRegex }
      ];
    }
    
    // Client type filter
    if (req.query.clientType) {
      filter.clientType = req.query.clientType;
    }
    
    // City filter
    if (req.query.city) {
      filter.city = new RegExp(req.query.city, 'i');
    }
    
    // Driver status filter
    if (req.query.isDriver === 'true' || req.query.isDriver === true) {
      filter.isDriver = true;
    } else if (req.query.isDriver === 'false' || req.query.isDriver === false) {
      filter.isDriver = false;
    }
    
    // Added joinby filter
    if (req.query.joinby) {
      filter.joinby = req.query.joinby;
    }
    
    // Sort options
    const sort = {};
    if (req.query.sortBy) {
      sort[req.query.sortBy] = req.query.sortOrder === 'asc' ? 1 : -1;
    } else {
      sort.createdAt = -1; // Default sort by creation date (newest first)
    }
    
    const clients = await Client.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);
      
    const total = await Client.countDocuments(filter);
    
    res.json({
      data: clients,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        limit
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Get single client with vehicles
exports.getClient = async (req, res) => {
  try {
    // Fetch client with vehicles
    const client = await Client.findById(req.params.id)
      .populate({
        path: 'vehicles',
        select: 'make model yearOfManufacture registrationNumber vehicleType createdAt usage',
        options: { sort: { createdAt: -1 } }
      })
      .lean();

    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    // Create a vehicle lookup map for quick access
    const vehiclesMap = {};
    client.vehicles.forEach(vehicle => {
      vehiclesMap[vehicle._id.toString()] = vehicle;
    });

    // Fetch insurances with populated vehicle data
    const insurances = await Insurance.find({ _id: { $in: client.insurances } })
      .select('policyNumber startDate endDate status insuranceType primeActuel primeTTC vehicle')
      .populate({
        path: 'vehicle',
        select: 'make model registrationNumber usage'
      })
      .sort({ startDate: -1 })
      .lean();

    // Extract insurance IDs
    const insuranceIds = insurances.map(ins => ins._id);

    // Fetch documents for these insurances
    const docs = await Document.find({ insurance: { $in: insuranceIds } })
      .select('name type fileUrl createdAt insurance')
      .lean();

    // Map docs to each insurance
    const docsMap = {};
    docs.forEach(doc => {
      const key = doc.insurance.toString();
      if (!docsMap[key]) docsMap[key] = [];
      docsMap[key].push(doc);
    });

    // Transform insurances with period, vehicleInfo, and attached docs
    const transformedInsurances = insurances.map(ins => {
      // Handle vehicle info safely
      let vehicleInfo = 'No vehicle';
      if (ins.vehicle && typeof ins.vehicle === 'object') {
        vehicleInfo = `${ins.vehicle.make || ''} ${ins.vehicle.model || ''} (${ins.vehicle.registrationNumber || ''})`;
      }

      return {
        ...ins,
        period: `${new Date(ins.startDate).toLocaleDateString()} - ${new Date(ins.endDate).toLocaleDateString()}`,
        vehicleInfo: vehicleInfo,
        documents: docsMap[ins._id.toString()] || []
      };
    });

    // Calculate vehicle ages
    const vehiclesWithAge = client.vehicles.map(v => ({
      ...v,
      age: new Date().getFullYear() - v.yearOfManufacture
    }));

    // Build response
    return res.json({
      success: true,
      client: {
        ...client,
        fullName: `${client.firstName} ${client.name}`,
        insurances: transformedInsurances,
        vehicles: vehiclesWithAge
      }
    });
  } catch (error) {
    console.error('getClient error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create client with enhanced fields
exports.createClient = async (req, res) => {
  try {
    // Extract client data from request body
    const {
      title,
      name,
      firstName,
      telephone,
      email,
      idType,
      idNumber,
      numCarte,
      dateOfBirth,
      gender,
      maritalStatus,
      numberOfChildren,
      address,
      city,
      postalCode,
      profession,
      isDriver,
      licenseCategory,
      licenseNumber,
      licenseCountry,
      licenseIssueDate,
      clientType
    } = req.body;
    
    const client = new Client({
      title,
      name,
      firstName,
      telephone,
      email,
      idType,
      idNumber,
      numCarte,
      dateOfBirth: new Date(dateOfBirth),
      gender,
      maritalStatus,
      numberOfChildren,
      address,
      city,
      postalCode,
      profession,
      isDriver,
      licenseCategory,
      licenseNumber,
      licenseCountry,
      licenseIssueDate: licenseIssueDate ? new Date(licenseIssueDate) : undefined,
      clientType,
      joinby: req.user._id, // Assuming req.user is set by authentication middleware
    });

    const newClient = await client.save();
    res.status(201).json(newClient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update client with enhanced fields
exports.updateClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });

    // Update all fields that are provided
    const fields = [
      'title', 'name', 'firstName', 'telephone', 'email',
      'idType', 'idNumber', 'numCarte',
      'dateOfBirth', 'gender', 'maritalStatus', 'numberOfChildren',
      'address', 'city', 'postalCode',
      'profession', 'isDriver',
      'licenseCategory', 'licenseNumber', 'licenseCountry', 'licenseIssueDate',
      'clientType', 'active'
    ];
    
    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        // Handle date fields
        if (['dateOfBirth', 'licenseIssueDate'].includes(field) && req.body[field]) {
          client[field] = new Date(req.body[field]);
        } else {
          client[field] = req.body[field];
        }
      }
    });

    const updatedClient = await client.save();
    res.json(updatedClient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete client
exports.deleteClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });

    // Check for existing relationships
    const [hasVehicles, hasInsurances] = await Promise.all([
      Vehicle.exists({ clientId: client._id }),
      Insurance.exists({ client: client._id })
    ]);

    if (hasVehicles || hasInsurances) {
      // Soft delete if relationships exist
      client.active = false;
      await client.save();
      return res.json({ 
        message: 'Client marked as inactive due to existing relationships',
        relationships: {
          vehicles: hasVehicles,
          insurances: hasInsurances
        }
      });
    }

    // Hard delete if no relationships
    await client.deleteOne();
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get client statistics
exports.getClientStats = async (req, res) => {
  try {
    const stats = await Client.aggregate([
      {
        $group: {
          _id: '$clientType',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const cityStats = await Client.aggregate([
      {
        $group: {
          _id: '$city',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    res.json({
      byType: stats,
      byCity: cityStats,
      total: await Client.countDocuments()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};