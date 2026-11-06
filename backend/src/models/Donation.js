import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
    },
    title: {
      type: String,
      required: [true, 'Please provide donation title'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide description of food'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      enum: [
        'Vegetarian',
        'Non-Vegetarian',
        'Fruits & Vegetables',
        'Groceries',
        'Bakery',
        'Prepared Meals',
        'Beverages',
        'Other',
      ],
      required: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Please specify quantity'],
      min: [1, 'Quantity must be at least 1'],
    },
    unit: {
      type: String,
      enum: ['portions', 'kg', 'boxes', 'crates', 'liters', 'packets'],
      default: 'portions',
      required: true,
    },
    estimatedMeals: {
      type: Number,
      default: 0,
    },
    images: {
      type: [String],
      default: [],
    },
    preparationDate: {
      type: Date,
      default: Date.now,
    },
    storageType: {
      type: String,
      enum: ['Room Temperature', 'Refrigerated', 'Frozen', 'Hot Holding'],
      default: 'Room Temperature',
      required: true,
    },
    allergens: {
      type: [String],
      default: [], // e.g. ['Nuts', 'Dairy', 'Gluten', 'Soy', 'None']
    },
    dietaryInfo: {
      type: [String],
      default: [], // e.g. ['Pure Veg', 'Vegan', 'Halal', 'Jain']
    },
    collectionDeadline: {
      type: Date,
      required: [true, 'Please specify collection deadline'],
    },
    pickupLocation: {
      address: { type: String, required: true },
      landmark: { type: String, default: '' },
      city: { type: String, default: 'Bangalore' },
      state: { type: String, default: 'Karnataka' },
      zipCode: { type: String, default: '' },
      instructions: { type: String, default: '' },
      contactPhone: { type: String, default: '' },
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        default: [77.5946, 12.9716],
      },
    },
    status: {
      type: String,
      enum: [
        'Available',
        'Requested',
        'Accepted',
        'Assigned',
        'Collected',
        'Delivered',
        'Cancelled',
        'Expired',
        'Rejected',
      ],
      default: 'Available',
      index: true,
    },
    safetyDeclaration: {
      isFresh: { type: Boolean, default: true },
      preparedHygienically: { type: Boolean, default: true },
      properlyPackaged: { type: Boolean, default: true },
      confirmedByDonor: { type: Boolean, default: true },
    },
    acceptedRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DonationRequest',
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        timestamp: { type: Date, default: Date.now },
        note: { type: String, default: '' },
      },
    ],
  },
  {
    timestamps: true,
  }
);

donationSchema.index({ location: '2dsphere' });
donationSchema.index({ status: 1, collectionDeadline: 1 });

// Helper to compute estimated meals
donationSchema.pre('save', function (next) {
  if (this.isModified('quantity') || this.isModified('unit') || this.isNew) {
    if (this.unit === 'portions') {
      this.estimatedMeals = this.quantity;
    } else if (this.unit === 'kg') {
      this.estimatedMeals = Math.round(this.quantity * 2.5); // ~400g per meal
    } else if (this.unit === 'boxes' || this.unit === 'crates') {
      this.estimatedMeals = this.quantity * 10;
    } else if (this.unit === 'packets') {
      this.estimatedMeals = this.quantity;
    } else {
      this.estimatedMeals = this.quantity;
    }
  }
  next();
});

export default mongoose.model('Donation', donationSchema);
