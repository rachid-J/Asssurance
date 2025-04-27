const Client = require('../models/Client');
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
    const client = await Client.findById(req.params.id)
      .populate({
        path: 'vehicles',
        select: 'make model yearOfManufacture registrationNumber vehicleType',
        options: { sort: { createdAt: -1 } }
  })
   .populate({
        path: 'policies',
        options: { sort: { startDate: -1 } }
      });

    if (!client) return res.status(404).json({ message: 'Client not found' });
    
    res.json({
      client: client.toObject({ virtuals: true }),
      vehicles: client.vehicles || [],
      policies: client.policies || []
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
      clientType
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

    // Check if client has vehicles
    const hasVehicles = await Vehicle.exists({ clientId: client._id });
    if (hasVehicles) {
      // Soft delete - just mark as inactive
      client.active = false;
      await client.save();
      res.json({ message: 'Client marked as inactive' });
    } else {
      // Hard delete
      await client.deleteOne();
      res.json({ message: 'Client deleted successfully' });
    }
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