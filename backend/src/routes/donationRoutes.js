import express from 'express';
import {
  createDonation,
  getDonations,
  getMyFood,
  claimFood,
  deleteFood,
} from '../controllers/donationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public
router.get('/', getDonations);

// Private (Any logged-in user or admin)
router.get('/my-food', protect, getMyFood);
router.post('/', protect, createDonation);
router.put('/:id/claim', protect, claimFood);
router.delete('/:id', protect, deleteFood);

export default router;
