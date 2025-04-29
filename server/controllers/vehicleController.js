const Vehicle = require('../models/Vehicle');
const Client = require('../models/Client');

// Get all vehicles with search and filters
exports.getVehicles = async (req, res) => {
  try {
    const { 
      search, 
      clientId, 
      vehicleType, 
      make,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;
    
    // Build query
    const query = {};
    
    // Search across multiple fields
    if (search) {
      query.$or = [
        { make: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { registrationNumber: { $regex: search, $options: 'i' } },
        { vinNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filters
    if (clientId) query.clientId = clientId;
    if (vehicleType) query.vehicleType = vehicleType;
    if (make) query.make = { $regex: make, $options: 'i' };
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Determine sort direction
    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    
    // Execute query
    const vehicles = await Vehicle.find(query)
    .sort({ [sortBy]: sortDirection })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('clientId', 'name firstName telephone')
    .populate('insuranceId','policyNumber'); // Changed from policyId
    // Count for pagination
    const totalCount = await Vehicle.countDocuments(query);
    
    res.json({
      vehicles,
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

// Get single vehicle with client details
exports.getVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
      .populate('clientId')
      .populate('insuranceId','policyNumber'); // Changed from policyId

      
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create vehicle
exports.createVehicle = async (req, res) => {
  try {
    // Check if client exists
    const client = await Client.findById(req.body.clientId);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    
    const vehicle = new Vehicle({
      clientId: req.body.clientId,
      make: req.body.make,
      model: req.body.model,
      yearOfManufacture: req.body.yearOfManufacture,
      registrationNumber: req.body.registrationNumber,
      vinNumber: req.body.vinNumber,
      vehicleType: req.body.vehicleType,
      fuelType: req.body.fuelType,
      usage: req.body.usage,
      engineSize: req.body.engineSize,
      horsePower: req.body.horsePower,
      numberOfSeats: req.body.numberOfSeats,
      weight: req.body.weight,
      documents: req.body.documents || []
    });
    
    const newVehicle = await vehicle.save();
    client.vehicles.push(newVehicle._id);
    await client.save();
    res.status(201).json(newVehicle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update vehicle
exports.updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    
    // Update fields that are provided
    const fields = [
      'make', 'model', 'yearOfManufacture', 'registrationNumber', 'vinNumber',
      'vehicleType', 'fuelType', 'usage',
      'engineSize', 'horsePower', 'numberOfSeats', 'weight',
      'active'
    ];
    
    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        vehicle[field] = req.body[field];
      }
    });
    
    // Handle documents separately for more flexibility
    if (req.body.documents) {
      vehicle.documents = req.body.documents;
    }
    
    // Add document if provided
    if (req.body.addDocument) {
      vehicle.documents.push(req.body.addDocument);
    }
    
    // Remove document if ID provided
    if (req.body.removeDocumentId) {
      vehicle.documents = vehicle.documents.filter(
        doc => doc._id.toString() !== req.body.removeDocumentId
      );
    }
    
    const updatedVehicle = await vehicle.save();
    res.json(updatedVehicle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete vehicle
exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    
    // Check if policies exist for this vehicle
    // This would require a Policy model with vehicleId field
    // const hasRelatedPolicies = await Policy.exists({ vehicleId: vehicle._id });
    
    // For now, just implement soft delete
    vehicle.active = false;
    await vehicle.save();
    res.json({ message: 'Vehicle marked as inactive' });
    
    // If no related records, could do hard delete
    // await vehicle.deleteOne();
    // res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add document to vehicle
exports.addVehicleDocument = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    
    vehicle.documents.push({
      type: req.body.type,
      number: req.body.number,
      issueDate: new Date(req.body.issueDate),
      expiryDate: new Date(req.body.expiryDate),
      issuingAuthority: req.body.issuingAuthority
    });
    
    const updatedVehicle = await vehicle.save();
    res.json(updatedVehicle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get vehicle statistics
exports.getVehicleStats = async (req, res) => {
  try {
    const byType = await Vehicle.aggregate([
      {
        $group: {
          _id: '$vehicleType',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const byMake = await Vehicle.aggregate([
      {
        $group: {
          _id: '$make',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    const byYear = await Vehicle.aggregate([
      {
        $group: {
          _id: '$yearOfManufacture',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      byType,
      byMake,
      byYear,
      total: await Vehicle.countDocuments()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Updated/Fixed addDocument and added deleteVehicleDocument functions

exports.addDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

    // Create document object with proper validation
    const newDocument = {
      type: req.body.type || 'Other',
      title: req.body.title || req.file.originalname,
      file: {
        path: req.file.path,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size
      },
      issueDate: req.body.issueDate ? new Date(req.body.issueDate) : new Date(),
      expiryDate: req.body.expiryDate ? new Date(req.body.expiryDate) : new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      issuingAuthority: req.body.issuingAuthority || '',
      notes: req.body.notes || ''
    };

    // Add document to vehicle
    vehicle.documents.push(newDocument);
    const updatedVehicle = await vehicle.save();

    // Return only the added document to reduce response size
    const addedDocument = updatedVehicle.documents[updatedVehicle.documents.length - 1];
    
    res.status(201).json({
      message: 'Document added successfully',
      document: addedDocument
    });
  } catch (error) {
    console.error('Error adding document:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getVehicleDocument = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.vehicleId);
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    const document = vehicle.documents.id(req.params.documentId);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check if file exists
    const fs = require('fs');
    if (!fs.existsSync(document.file.path)) {
      return res.status(404).json({ message: 'Document file not found on server' });
    }

    res.download(document.file.path, document.file.originalName);
  } catch (error) {
    console.error('Error retrieving document:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.deleteVehicleDocument = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.vehicleId);
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    // Find document by ID
    const document = vehicle.documents.id(req.params.documentId);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Delete physical file if it exists
    const fs = require('fs');
    if (fs.existsSync(document.file.path)) {
      fs.unlinkSync(document.file.path);
    }

    // Remove document from array
    vehicle.documents.pull(req.params.documentId);
    await vehicle.save();
    
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ message: error.message });
  }
};

