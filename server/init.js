const User = require('./models/User');
const bcrypt = require('bcryptjs');

const initAdmin = async () => {
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
};

module.exports = initAdmin;
