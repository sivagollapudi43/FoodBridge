import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide food title'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Cooked Food', 'Raw Groceries', 'Fruits & Vegetables', 'Bakery', 'Packaged Food', 'Other'],
      default: 'Cooked Food',
    },
    quantity: {
      type: String,
      required: [true, 'Please specify quantity (e.g. 50 plates, 10 kg, 4 boxes)'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    pickupAddress: {
      type: String,
      required: [true, 'Please provide pickup address'],
    },
    city: {
      type: String,
      default: 'Bangalore',
    },
    contactPhone: {
      type: String,
      required: [true, 'Please provide contact phone number for pickup'],
    },
    availableUntil: {
      type: String,
      default: 'Today before 9:00 PM',
    },
    status: {
      type: String,
      enum: ['Available', 'Claimed', 'Completed'],
      default: 'Available',
      index: true,
    },
    claimedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Donation', donationSchema);
