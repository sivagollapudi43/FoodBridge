import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from '../models/User.js';
import Donation from '../models/Donation.js';
import { connectDB } from '../config/db.js';

export const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('[Seeder] Resetting database with simple Admin & User structure...');
    await User.deleteMany({});
    await Donation.deleteMany({});

    // 1. Admin
    const admin = await User.create({
      name: 'Siva Gollapudi (Admin)',
      email: 'sivagollapudi43@gmail.com',
      password: 'password123',
      role: 'admin',
      phone: '+91 93478 89334',
      city: 'Bangalore',
      address: 'FoodBridge HQ, Indiranagar',
    });

    // 2. Regular User
    const user = await User.create({
      name: 'Rahul Sharma',
      email: 'user@foodbridge.com',
      password: 'password123',
      role: 'user',
      phone: '+91 98765 43210',
      city: 'Bangalore',
      address: '100 Feet Road, Indiranagar',
    });

    // 3. Second Regular User
    const user2 = await User.create({
      name: 'Ananya Roy',
      email: 'ananya@gmail.com',
      password: 'password123',
      role: 'user',
      phone: '+91 91234 56789',
      city: 'Bangalore',
      address: 'Koramangala 4th Block',
    });

    // Create Sample Available Food Listings
    await Donation.create([
      {
        user: user._id,
        title: 'Fresh Veg Biryani & Cucumber Raita',
        category: 'Cooked Food',
        quantity: '40 plates / portions',
        description: 'Surplus food from afternoon corporate lunch. Fresh, warm, and packed in food containers.',
        pickupAddress: '100 Feet Road, Indiranagar',
        city: 'Bangalore',
        contactPhone: '+91 98765 43210',
        availableUntil: 'Today before 8:00 PM',
        status: 'Available',
      },
      {
        user: user._id,
        title: 'Freshly Baked Breads & Whole Wheat Buns',
        category: 'Bakery',
        quantity: '25 packets',
        description: 'End-of-day fresh artisanal bread from bakery, sealed in paper bags.',
        pickupAddress: 'CMH Road, Indiranagar',
        city: 'Bangalore',
        contactPhone: '+91 98765 43210',
        availableUntil: 'Today before 9:30 PM',
        status: 'Available',
      },
      {
        user: user2._id,
        title: 'Organic Apples, Bananas & Oranges Crate',
        category: 'Fruits & Vegetables',
        quantity: '30 kg',
        description: 'Surplus fresh fruits from morning market delivery, perfectly ripe and healthy.',
        pickupAddress: 'Koramangala 4th Block, near Sony World Signal',
        city: 'Bangalore',
        contactPhone: '+91 91234 56789',
        availableUntil: 'Tomorrow before 12:00 PM',
        status: 'Available',
      },
      {
        user: user2._id,
        title: 'Dal Makhani & Jeera Rice Meal Boxes',
        category: 'Cooked Food',
        quantity: '60 boxes',
        description: 'Banquet event surplus food, packed hygienically in meal boxes.',
        pickupAddress: 'HSR Layout Sector 2',
        city: 'Bangalore',
        contactPhone: '+91 91234 56789',
        availableUntil: 'Today before 10:00 PM',
        status: 'Available',
      },
    ]);

    console.log('[Seeder] Database successfully populated!');
    console.log('========================================================================');
    console.log(' Simplified Login Credentials:');
    console.log(' - Admin: sivagollapudi43@gmail.com / password123');
    console.log(' - User:  user@foodbridge.com        / password123');
    console.log('========================================================================');
  } catch (error) {
    console.error('[Seeder Error]', error);
  } finally {
    await mongoose.disconnect();
  }
};

if (process.argv[1]?.includes('seeder.js')) {
  seedDatabase();
}
