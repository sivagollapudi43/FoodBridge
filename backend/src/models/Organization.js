import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide organization name'],
      trim: true,
    },
    type: {
      type: String,
      enum: [
        'restaurant',
        'hotel',
        'supermarket',
        'caterer',
        'event_organizer',
        'ngo',
        'charity',
        'shelter',
        'other',
      ],
      required: true,
    },
    registrationNumber: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: 'Bangalore' },
      state: { type: String, default: 'Karnataka' },
      zipCode: { type: String, default: '' },
      country: { type: String, default: 'India' },
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [77.5946, 12.9716],
      },
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    verificationDocumentUrl: {
      type: String,
      default: '',
    },
    verifiedAt: {
      type: Date,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    capacity: {
      maxMealsPerDay: { type: Number, default: 200 },
      hasColdStorage: { type: Boolean, default: false },
      hasOwnTransport: { type: Boolean, default: false },
    },
    preferredCategories: {
      type: [String],
      default: ['Vegetarian', 'Non-Vegetarian', 'Fruits & Vegetables', 'Groceries', 'Bakery', 'Prepared Meals'],
    },
    serviceRadiusKm: {
      type: Number,
      default: 20,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

organizationSchema.index({ location: '2dsphere' });

export default mongoose.model('Organization', organizationSchema);
