import mongoose from 'mongoose';

const volunteerAssignmentSchema = new mongoose.Schema(
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
    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['assigned', 'accepted', 'declined', 'in_progress', 'completed', 'cancelled'],
      default: 'assigned',
      index: true,
    },
    declineReason: {
      type: String,
      default: '',
    },
    instructions: {
      type: String,
      default: '',
    },
    respondedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('VolunteerAssignment', volunteerAssignmentSchema);

