import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from '../models/User.js';
import Organization from '../models/Organization.js';
import Donation from '../models/Donation.js';
import DonationRequest from '../models/DonationRequest.js';
import VolunteerAssignment from '../models/VolunteerAssignment.js';
import Delivery from '../models/Delivery.js';
import Notification from '../models/Notification.js';
import AuditLog from '../models/AuditLog.js';
import { connectDB } from '../config/db.js';

export const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('[Seeder] Clearing old records...');
    await User.deleteMany({});
    await Organization.deleteMany({});
    await Donation.deleteMany({});
    await DonationRequest.deleteMany({});
    await VolunteerAssignment.deleteMany({});
    await Delivery.deleteMany({});
    await Notification.deleteMany({});
    await AuditLog.deleteMany({});

    console.log('[Seeder] Creating Users & Organizations...');

    // 1. Admin
    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@foodbridge.org',
      password: 'password123',
      role: 'admin',
      phone: '+91 98765 43210',
      address: { street: 'FoodBridge HQ, MG Road', city: 'Bangalore', state: 'Karnataka' },
      isVerified: true,
    });

    // 2. Verified Donor (Green Plate Bistro)
    const donorUser = await User.create({
      name: 'Green Plate Bistro',
      email: 'donor@greenplate.com',
      password: 'password123',
      role: 'donor',
      phone: '+91 91234 56789',
      address: { street: '100 Feet Road, Indiranagar', city: 'Bangalore', state: 'Karnataka' },
      location: { type: 'Point', coordinates: [77.6408, 12.9784] },
      isVerified: true,
    });

    const donorOrg = await Organization.create({
      name: 'Green Plate Hospitality Group',
      type: 'restaurant',
      registrationNumber: 'GSTIN29AAACG1234A1Z5',
      contactEmail: 'donor@greenplate.com',
      contactPhone: '+91 91234 56789',
      address: { street: '100 Feet Road, Indiranagar', city: 'Bangalore', state: 'Karnataka' },
      location: { type: 'Point', coordinates: [77.6408, 12.9784] },
      verificationStatus: 'verified',
      owner: donorUser._id,
    });
    donorUser.organization = donorOrg._id;
    await donorUser.save();

    // 3. Verified NGO (Hope Feed Foundation)
    const ngoUser = await User.create({
      name: 'Hope Feed Foundation',
      email: 'ngo@hopefeed.org',
      password: 'password123',
      role: 'ngo',
      phone: '+91 98450 11223',
      address: { street: 'Koramangala 4th Block', city: 'Bangalore', state: 'Karnataka' },
      location: { type: 'Point', coordinates: [77.6245, 12.9352] },
      isVerified: true,
    });

    const ngoOrg = await Organization.create({
      name: 'Hope Feed Community Relief',
      type: 'ngo',
      registrationNumber: 'NGO-KAR-2022-8871',
      contactEmail: 'ngo@hopefeed.org',
      contactPhone: '+91 98450 11223',
      address: { street: 'Koramangala 4th Block', city: 'Bangalore', state: 'Karnataka' },
      location: { type: 'Point', coordinates: [77.6245, 12.9352] },
      verificationStatus: 'verified',
      capacity: { maxMealsPerDay: 500, hasColdStorage: true, hasOwnTransport: true },
      owner: ngoUser._id,
    });
    ngoUser.organization = ngoOrg._id;
    await ngoUser.save();

    // 4. Pending NGO (City Care Shelter)
    const pendingNgoUser = await User.create({
      name: 'City Care Shelter',
      email: 'ngo@citycare.org',
      password: 'password123',
      role: 'ngo',
      phone: '+91 99887 76655',
      address: { street: 'Malleshwaram 8th Cross', city: 'Bangalore', state: 'Karnataka' },
      location: { type: 'Point', coordinates: [77.5684, 13.0031] },
      isVerified: false, // Pending verification
    });

    const pendingNgoOrg = await Organization.create({
      name: 'City Care Orphanage & Shelter',
      type: 'shelter',
      registrationNumber: 'SHELTER-BLR-4091',
      contactEmail: 'ngo@citycare.org',
      contactPhone: '+91 99887 76655',
      address: { street: 'Malleshwaram 8th Cross', city: 'Bangalore', state: 'Karnataka' },
      location: { type: 'Point', coordinates: [77.5684, 13.0031] },
      verificationStatus: 'pending',
      capacity: { maxMealsPerDay: 150, hasColdStorage: false, hasOwnTransport: false },
      owner: pendingNgoUser._id,
    });
    pendingNgoUser.organization = pendingNgoOrg._id;
    await pendingNgoUser.save();

    // 5. Active Volunteer (Kiran Kumar)
    const volunteerUser = await User.create({
      name: 'Kiran Kumar',
      email: 'volunteer@speedy.com',
      password: 'password123',
      role: 'volunteer',
      phone: '+91 97401 23456',
      address: { street: 'HSR Layout Sector 2', city: 'Bangalore', state: 'Karnataka' },
      location: { type: 'Point', coordinates: [77.6413, 12.9121] },
      isVerified: true,
      volunteerProfile: {
        vehicleType: 'motorcycle',
        isAvailable: true,
        completedDeliveries: 14,
        maxDistanceKm: 20,
      },
    });

    console.log('[Seeder] Creating Realistic Food Donations...');

    const tomorrow = new Date(Date.now() + 24 * 3600 * 1000);
    const inThreeHours = new Date(Date.now() + 4 * 3600 * 1000);
    const inEightHours = new Date(Date.now() + 8 * 3600 * 1000);

    // Donation 1: Available
    const donation1 = await Donation.create({
      donor: donorUser._id,
      organization: donorOrg._id,
      title: 'Nutritious Vegetable Biryani & Fresh Cucumber Raita',
      description:
        'Freshly prepared surplus biryani from lunch corporate catering. Hygienically packed in insulated warm containers.',
      category: 'Prepared Meals',
      quantity: 120,
      unit: 'portions',
      storageType: 'Hot Holding',
      allergens: ['Dairy'],
      dietaryInfo: ['Pure Veg', 'Halal'],
      collectionDeadline: inFourHoursOr(inFourHoursOrToday(6)),
      pickupLocation: {
        address: '100 Feet Road, Indiranagar',
        landmark: 'Opposite Metro Pillar 42',
        city: 'Bangalore',
        instructions: 'Pickup from service bay entrance at the back.',
        contactPhone: '+91 91234 56789',
      },
      location: { type: 'Point', coordinates: [77.6408, 12.9784] },
      status: 'Available',
    });

    // Donation 2: Available
    const donation2 = await Donation.create({
      donor: donorUser._id,
      organization: donorOrg._id,
      title: 'Artisan Sourdough Breads & Whole Wheat Croissants',
      description:
        'End-of-day fresh artisanal bread and buns. Sealed in food-grade kraft bags, ready for evening dinner distribution.',
      category: 'Bakery',
      quantity: 35,
      unit: 'kg',
      storageType: 'Room Temperature',
      allergens: ['Gluten'],
      dietaryInfo: ['Vegetarian'],
      collectionDeadline: inFourHoursOr(inFourHoursOrToday(12)),
      pickupLocation: {
        address: '100 Feet Road, Indiranagar',
        city: 'Bangalore',
        contactPhone: '+91 91234 56789',
      },
      location: { type: 'Point', coordinates: [77.6408, 12.9784] },
      status: 'Available',
    });

    // Donation 3: Available
    const donation3 = await Donation.create({
      donor: donorUser._id,
      organization: donorOrg._id,
      title: 'Fresh Farm Apples, Oranges & Bananas Crate',
      description:
        'High quality surplus fresh fruits from weekly breakfast buffet. Rich in vitamins, ideal for community children shelter.',
      category: 'Fruits & Vegetables',
      quantity: 45,
      unit: 'kg',
      storageType: 'Room Temperature',
      allergens: [],
      dietaryInfo: ['Vegan', 'Gluten-Free'],
      collectionDeadline: tomorrow,
      pickupLocation: {
        address: '100 Feet Road, Indiranagar',
        city: 'Bangalore',
        contactPhone: '+91 91234 56789',
      },
      location: { type: 'Point', coordinates: [77.6408, 12.9784] },
      status: 'Available',
    });

    // Donation 4: In Progress / Assigned to Volunteer
    const donation4 = await Donation.create({
      donor: donorUser._id,
      organization: donorOrg._id,
      title: 'Dal Makhani, Jeera Rice & Tandoori Rotis',
      description:
        'Surplus banquet dinners packed securely in meal boxes. Fully cooked and kept in food warmer.',
      category: 'Prepared Meals',
      quantity: 80,
      unit: 'portions',
      storageType: 'Hot Holding',
      allergens: ['Dairy', 'Gluten'],
      dietaryInfo: ['Pure Veg'],
      collectionDeadline: inThreeHours,
      pickupLocation: {
        address: '100 Feet Road, Indiranagar',
        city: 'Bangalore',
        contactPhone: '+91 91234 56789',
      },
      location: { type: 'Point', coordinates: [77.6408, 12.9784] },
      status: 'Assigned',
    });

    const request4 = await DonationRequest.create({
      donation: donation4._id,
      ngo: ngoUser._id,
      organization: ngoOrg._id,
      message: 'Urgent distribution planned for night shelter community at Koramangala.',
      estimatedBeneficiaries: 80,
      transportMethod: 'Volunteer Courier',
      requestedPickupTime: new Date(Date.now() + 1 * 3600 * 1000),
      status: 'accepted',
      respondedAt: new Date(),
    });

    donation4.acceptedRequest = request4._id;
    await donation4.save();

    const assignment4 = await VolunteerAssignment.create({
      donation: donation4._id,
      request: request4._id,
      volunteer: volunteerUser._id,
      assignedBy: ngoUser._id,
      instructions: 'Please verify hot food packaging before loading onto thermal bag.',
      status: 'accepted',
    });

    const delivery4 = await Delivery.create({
      donation: donation4._id,
      request: request4._id,
      assignment: assignment4._id,
      volunteer: volunteerUser._id,
      ngo: ngoUser._id,
      donor: donorUser._id,
      pickupLocation: {
        address: '100 Feet Road, Indiranagar',
        city: 'Bangalore',
        coordinates: [77.6408, 12.9784],
        contactPhone: '+91 91234 56789',
      },
      dropoffLocation: {
        address: 'Koramangala 4th Block, Night Shelter',
        city: 'Bangalore',
        coordinates: [77.6245, 12.9352],
        contactPhone: '+91 98450 11223',
      },
      status: 'en_route_pickup',
      pickupVerificationCode: '482910',
      deliveryVerificationCode: '739104',
      isPickupVerified: false,
      isDeliveryVerified: false,
    });

    // Donation 5: Delivered (For metrics and past history)
    const donation5 = await Donation.create({
      donor: donorUser._id,
      organization: donorOrg._id,
      title: 'Steamed Rice, Sambar & Mixed Vegetable Poriyal',
      description: 'Delivered earlier today to local orphanage.',
      category: 'Prepared Meals',
      quantity: 150,
      unit: 'portions',
      storageType: 'Hot Holding',
      allergens: [],
      dietaryInfo: ['Pure Veg'],
      collectionDeadline: new Date(Date.now() - 6 * 3600 * 1000),
      pickupLocation: {
        address: '100 Feet Road, Indiranagar',
        city: 'Bangalore',
      },
      location: { type: 'Point', coordinates: [77.6408, 12.9784] },
      status: 'Delivered',
    });

    console.log('[Seeder] Database successfully populated with realistic FoodBridge test data!');
    console.log('========================================================================');
    console.log(' Demo Login Credentials:');
    console.log(' - Admin:      admin@foodbridge.org   / password123');
    console.log(' - Donor:      donor@greenplate.com   / password123');
    console.log(' - NGO (Ver):  ngo@hopefeed.org       / password123');
    console.log(' - NGO (Pend): ngo@citycare.org       / password123');
    console.log(' - Volunteer:  volunteer@speedy.com   / password123');
    console.log('========================================================================');
  } catch (error) {
    console.error('[Seeder Error]', error);
  } finally {
    await mongoose.disconnect();
  }
};

function inFourHoursOrToday(hoursAhead) {
  return new Date(Date.now() + hoursAhead * 3600 * 1000);
}

function inFourHoursOr(d) {
  return d;
}

// Run seeder if executed directly
if (process.argv[1]?.includes('seeder.js')) {
  seedDatabase();
}
