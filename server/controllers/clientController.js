const Client = require('../models/Client');
const Vehicle = require('../models/Vehicle');

// Get all clients with advanced search
exports.getClients = async (req, res) => {
  try {
    const { 
      search, 
      clientType, 
      city, 
      isDriver,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;
    
    // Build query
    const query = {};
    
    // Text search across multiple fields
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { telephone: { $regex: search, $options: 'i' } },
        { idNumber: { $regex: search, $options: 'i' } },
        { numCarte: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Add filters
    if (clientType) query.clientType = clientType;
    if (city) query.city = { $regex: city, $options: 'i' };
    if (isDriver !== undefined) query.isDriver = isDriver === 'true';
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Determine sort direction
    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    
    // Execute query with pagination and sorting
    const clients = await Client.find(query)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const totalCount = await Client.countDocuments(query);
    
    res.json({
      clients,
      pagination: {
        totalRecords: totalCount,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single client with vehicles
exports.getClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });
    
    // Get vehicles associated with this client
    const vehicles = await Vehicle.find({ clientId: client._id });
    
    res.json({
      client,
      vehicles
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