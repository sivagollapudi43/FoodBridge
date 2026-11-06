import express from 'express';
import {
  createRequest,
  acceptRequest,
  rejectRequest,
  getMyRequests,
} from '../controllers/requestController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, authorize('ngo', 'admin'), createRequest);
router.get('/my-requests', protect, authorize('ngo', 'admin'), getMyRequests);
router.put('/:id/accept', protect, authorize('donor', 'admin'), acceptRequest);
router.put('/:id/reject', protect, authorize('donor', 'admin'), rejectRequest);

export default router;
