import express from 'express';
import {
  createDonation,
  getDonations,
  getDonationById,
  getMyDonations,
  getDonorStats,
  getRecommendedNGOs,
} from '../controllers/donationController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getDonations);
router.get('/my-donations', protect, getMyDonations);
router.get('/donor-stats', protect, getDonorStats);
router.get('/:id', getDonationById);
router.get('/:id/recommendations', protect, getRecommendedNGOs);

// Protected routes
router.post('/', protect, authorize('donor', 'admin'), createDonation);

export default router;
