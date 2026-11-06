import mongoose from 'mongoose';

const deliverySchema = new mongoose.Schema(
  {
    donation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation',
      required: true,
    },
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DonationRequest',
      required: true,
    },
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VolunteerAssignment',
    },
    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ngo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    pickupLocation: {
      address: { type: String, required: true },
      landmark: { type: String, default: '' },
      city: { type: String, default: '' },
      coordinates: { type: [Number], default: [77.5946, 12.9716] },
      contactPhone: { type: String, default: '' },
    },
    dropoffLocation: {
      address: { type: String, required: true },
      landmark: { type: String, default: '' },
      city: { type: String, default: '' },
      coordinates: { type: [Number], default: [77.5946, 12.9716] },
      contactPhone: { type: String, default: '' },
    },
    status: {
      type: String,
      enum: [
        'scheduled',
        'en_route_pickup',
        'collected',
        'en_route_dropoff',
        'delivered',
        'failed',
      ],
      default: 'scheduled',
      index: true,
    },
    pickupVerificationCode: {
      type: String,
      required: true,
    },
    deliveryVerificationCode: {
      type: String,
      required: true,
    },
    isPickupVerified: {
      type: Boolean,
      default: false,
    },
    isDeliveryVerified: {
      type: Boolean,
      default: false,
    },
    pickupProofImage: {
      type: String,
      default: '',
    },
    deliveryProofImage: {
      type: String,
      default: '',
    },
    pickupTimestamp: {
      type: Date,
    },
    deliveryTimestamp: {
      type: Date,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Delivery', deliverySchema);
