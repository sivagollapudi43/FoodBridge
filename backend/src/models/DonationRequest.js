import mongoose from 'mongoose';

const donationRequestSchema = new mongoose.Schema(
  {
    donation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation',
      required: true,
    },
    ngo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'cancelled'],
      default: 'pending',
      index: true,
    },
    message: {
      type: String,
      required: [true, 'Please provide request message/purpose'],
      trim: true,
    },
    estimatedBeneficiaries: {
      type: Number,
      required: [true, 'Please specify estimated number of beneficiaries'],
      min: [1, 'Must be at least 1 beneficiary'],
    },
    transportMethod: {
      type: String,
      enum: ['Volunteer Courier', 'Own Vehicle', 'Shelter Bus', 'On-foot Pickup'],
      default: 'Volunteer Courier',
    },
    requestedPickupTime: {
      type: Date,
      required: true,
    },
    respondedAt: {
      type: Date,
    },
    responseNote: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate pending requests from same NGO for the same donation
donationRequestSchema.index({ donation: 1, ngo: 1 }, { unique: true });

export default mongoose.model('DonationRequest', donationRequestSchema);

