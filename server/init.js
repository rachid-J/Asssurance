const User = require('./models/User');
const Client = require('./models/Client');
const Vehicle = require('./models/Vehicle');
const Policy = require('./models/Policy');
const bcrypt = require('bcryptjs');

// Initialize Admin
const initAdmin = async () => {
  try {
    const adminEmail = 'admin@assurance.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        username: 'admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
      });
      console.log('✅ Admin user initialized (admin@assurance.com / admin123)');
    } else {
      console.log('ℹ️ Admin already exists');
    }
  } catch (error) {
    console.error('Admin initialization error:', error.message);
  }
};

// Initialize Sample Client
const initClient = async () => {
  try {
    const sampleClient = {
      title: 'Mr',
      name: 'Doe',
      firstName: 'John',
      telephone: '+212600000000',
      email: 'john.doe@example.com',
      idType: 'CIN',
      idNumber: 'AB123456',
      dateOfBirth: new Date(1990, 0, 1),
      gender: 'Masculin',
      address: '123 Main Street',
      city: 'Casablanca',
      postalCode: '20000',
      profession: 'Engineer'
    };

    const existingClient = await Client.findOne({ email: sampleClient.email });
    if (!existingClient) {
      await Client.create(sampleClient);
      console.log('✅ Sample client initialized');
    }
  } catch (error) {
    console.error('Client initialization error:', error.message);
  }
};

// Initialize Sample Vehicle
const initVehicle = async () => {
  try {
    const client = await Client.findOne({ email: 'john.doe@example.com' });
    
    if (client) {
      const sampleVehicle = {
        clientId: client._id, // As ObjectId
        make: 'Renault',
        model: 'Clio',
        yearOfManufacture: 2020,
        registrationNumber: 'ABC1234',
        vehicleType: 'Car',
        fuelType: 'Diesel'
      };

      const existingVehicle = await Vehicle.findOne({ 
        registrationNumber: sampleVehicle.registrationNumber 
      });
      
      if (!existingVehicle) {
        const newVehicle = await Vehicle.create(sampleVehicle);
        
        // Add vehicle to client's vehicles array
        await Client.findByIdAndUpdate(
          client._id,
          { $push: { vehicles: newVehicle._id } },
          { new: true }
        );
        
        console.log('✅ Sample vehicle initialized');
      }
    }
  } catch (error) {
    console.error('Vehicle initialization error:', error.message);
  }
};
// Initialize Sample Policy

// Main initialization function

module.exports = {
  initAdmin,
  initClient,
  initVehicle,

};