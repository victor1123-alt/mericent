require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const slugify = require('slugify');

const ProductDb = require('../models/product');
const UserDb = require('../models/user');

const MONGO = process.env.MONGO_CONNECTION || 'mongodb://127.0.0.1:27017/mercient';

async function main() {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_PROD_SEED !== 'true') {
    console.error('Refusing to run seed in production. Set ALLOW_PROD_SEED=true to override.');
    process.exit(1);
  }

  await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB for seeding');

  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@mercient.test.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Password123!';

  // Create admin user if not exists
  let admin = await UserDb.findOne({ email: adminEmail });
  if (!admin) {
    const hashed = await bcrypt.hash(adminPassword, 10);
    admin = await UserDb.create({
      firstName: 'Admin',
      lastName: 'User',
      email: adminEmail,
      password: hashed,
      role: 'admin'
    });
    console.log(`Created admin user: ${adminEmail} / ${adminPassword}`);
  } else {
    console.log(`Admin user already exists: ${adminEmail}`);
  }

  // Sample products
  const products = [
    {
      productName: 'Classic White Tee',
      slug: slugify('Classic White Tee', { lower: true }),
      sku: 'TEE-WHITE-001',
      description: 'Comfortable classic white t-shirt made from 100% cotton.',
      price: 2500,
      quantity: 50,
      category: 'menswear',
      img: 'https://images.unsplash.com/photo-1520975919256-7e9f1ea7f19f?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1520975919256-7e9f1ea7f19f?auto=format&fit=crop&w=800&q=80',
      ],
      sizes: ['S','M','L','XL'],
      colors: ['#ffffff', '#000000'],
      isAvailable: true
    },
    {
      productName: 'Slim Fit Jeans',
      slug: slugify('Slim Fit Jeans', { lower: true }),
      sku: 'JEANS-SLIM-001',
      description: 'Stylish slim fit denim with a comfortable stretch.',
      price: 7500,
      quantity: 40,
      category: 'jeans',
      img: 'https://images.unsplash.com/photo-1514995669114-6081e934b693?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1514995669114-6081e934b693?auto=format&fit=crop&w=800&q=80'
      ],
      sizes: ['30','32','34','36'],
      colors: ['Blue','Black'],
      isAvailable: true
    },
    {
      productName: 'Everyday Backpack',
      slug: slugify('Everyday Backpack', { lower: true }),
      sku: 'BAG-001',
      description: 'Durable backpack for daily use with multiple compartments.',
      price: 10000,
      quantity: 20,
      category: 'bags',
      img: 'https://images.unsplash.com/photo-1526178611989-8d5a9e5a0b78?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1526178611989-8d5a9e5a0b78?auto=format&fit=crop&w=800&q=80'
      ],
      sizes: [],
      colors: ['Black','Olive'],
      isAvailable: true
    },
    {
      productName: 'Classic Heels',
      slug: slugify('Classic Heels', { lower: true }),
      sku: 'HEELS-RED-001',
      description: 'Elegant heels perfect for an evening out.',
      price: 15000,
      quantity: 15,
      category: 'heels',
      img: 'https://images.unsplash.com/photo-1552346157-0c3f5b25c1d5?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1552346157-0c3f5b25c1d5?auto=format&fit=crop&w=800&q=80'
      ],
      sizes: ['36','37','38','39','40'],
      colors: ['Red','Black'],
      isAvailable: true
    },
    {
      productName: 'Signature Cap',
      slug: slugify('Signature Cap', { lower: true }),
      sku: 'CAP-001',
      description: 'Classic cap with embroidered logo.',
      price: 2000,
      quantity: 80,
      category: 'cap',
      img: 'https://images.unsplash.com/photo-1520975919256-7e9f1ea7f19f?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1520975919256-7e9f1ea7f19f?auto=format&fit=crop&w=800&q=80'
      ],
      sizes: [],
      colors: ['Black','White'],
      isAvailable: true
    }
  ];

  // Insert products if they don't exist
  let inserted = 0;
  for (const p of products) {
    const exists = await ProductDb.findOne({ sku: p.sku });
    if (exists) {
      console.log(`Product exists, skipping: ${p.sku}`);
    } else {
      await ProductDb.create(p);
      console.log(`Inserted product: ${p.sku}`);
      inserted++;
    }
  }

  console.log(`Seeding complete. Products inserted: ${inserted}`);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error('Seeding failed:', err);
  mongoose.disconnect().finally(() => process.exit(1));
});