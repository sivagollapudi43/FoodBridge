import express from 'express';
import {
  getAdminAnalytics,
  getAllUsers,
  verifyNgo,
  updateUserStatus,
  getAuditLogs,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Restrict all routes to admin
router.use(protect, authorize('admin'));

router.get('/analytics', getAdminAnalytics);
router.get('/users', getAllUsers);
router.put('/verify-ngo/:id', verifyNgo);
router.put('/users/:id/status', updateUserStatus);
router.get('/audit-logs', getAuditLogs);

export default router;
