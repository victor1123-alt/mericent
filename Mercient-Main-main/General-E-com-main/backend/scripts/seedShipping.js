const mongoose = require('mongoose');
const Shipping = require('../models/shipping');
require('dotenv').config();

const seedShipping = async () => {
  try {
    const connectionString = process.env.MONGO_CONNECTION || 'mongodb://127.0.0.1:27017/mercient';
    await mongoose.connect(connectionString);

    // Clear existing shipping options
    await Shipping.deleteMany({});

    // Seed default shipping options for major states
    const shippingOptions = [
      {
        name: 'Standard Delivery',
        state: 'Lagos',
        basePrice: 2500,
        pricePerItem: 500,
        maxItemsForBase: 2,
        discountPercentage: 10,
        discountActive: true
      },
      {
        name: 'Standard Delivery',
        state: 'Abuja',
        basePrice: 3000,
        pricePerItem: 600,
        maxItemsForBase: 2,
        discountPercentage: 5,
        discountActive: true
      },
      {
        name: 'Standard Delivery',
        state: 'Kano',
        basePrice: 3500,
        pricePerItem: 700,
        maxItemsForBase: 1,
        discountPercentage: 0,
        discountActive: false
      },
      {
        name: 'Standard Delivery',
        state: 'Rivers',
        basePrice: 2800,
        pricePerItem: 550,
        maxItemsForBase: 2,
        discountPercentage: 15,
        discountActive: true
      },
      {
        name: 'Standard Delivery',
        state: 'Oyo',
        basePrice: 2700,
        pricePerItem: 520,
        maxItemsForBase: 2,
        discountPercentage: 8,
        discountActive: true
      }
    ];

    await Shipping.insertMany(shippingOptions);
    console.log('Shipping options seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding shipping options:', error);
    process.exit(1);
  }
};

seedShipping();