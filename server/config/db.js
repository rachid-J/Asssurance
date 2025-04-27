const mongoose = require('mongoose');


const { initAdmin, initClient, initVehicle, initPolicy } = require('../init');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
     // Run initializations in sequence
     await initAdmin();
     await initClient();
     await initVehicle();
     await initPolicy();// Initialize admin user

    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

module.exports = connectDB;