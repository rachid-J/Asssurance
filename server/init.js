const User = require('./models/User');

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

// Initialize Sample Policy

// Main initialization function

module.exports = {
  initAdmin,
 

};