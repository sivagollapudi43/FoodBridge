import express from 'express';
import { getAdminOverview, deleteUser } from '../controllers/adminController.js';
import { deleteFood } from '../controllers/donationController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Apply admin protection to all routes
router.use(protect, adminOnly);

router.get('/overview', getAdminOverview);
router.delete('/users/:id', deleteUser);
router.delete('/food/:id', deleteFood);

export default router;
