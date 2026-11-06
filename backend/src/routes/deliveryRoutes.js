import express from 'express';
import {
  assignVolunteer,
  getMyDeliveries,
  getNgoDeliveries,
  respondAssignment,
  verifyPickup,
  verifyDelivery,
  getAvailableVolunteers,
} from '../controllers/deliveryController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/my-deliveries', protect, authorize('volunteer', 'admin'), getMyDeliveries);
router.get('/ngo-deliveries', protect, authorize('ngo', 'admin'), getNgoDeliveries);
router.get('/available-volunteers', protect, authorize('ngo', 'admin'), getAvailableVolunteers);

router.post('/:id/assign-volunteer', protect, authorize('ngo', 'admin'), assignVolunteer);
router.put('/:id/respond-assignment', protect, authorize('volunteer', 'admin'), respondAssignment);
router.put('/:id/verify-pickup', protect, verifyPickup);
router.put('/:id/verify-delivery', protect, verifyDelivery);

export default router;
