const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
require('dotenv').config();

const createAdminUser = async () => {
  try {
    const connectionString = process.env.MONGO_CONNECTION || 'mongodb://127.0.0.1:27017/mercient';
    await mongoose.connect(connectionString);

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@mercient.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@mercient.com',
      password: hashedPassword,
      role: 'admin',
      isActive: true
    });

    await adminUser.save();
    console.log('Admin user created successfully!');
    console.log('Email: admin@mercient.com');
    console.log('Password: admin123');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdminUser();