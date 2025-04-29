const mongoose = require('mongoose');


const { initAdmin } = require('../init');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
     // Run initializations in sequence
     await initAdmin();
     
    

    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

module.exports = connectDB;