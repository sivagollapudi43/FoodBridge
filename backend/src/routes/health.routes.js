import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    Check API and Database Health Status
 * @access  Public
 */
router.get('/', (req, res) => {
  const dbStates = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting',
  };

  const dbState = mongoose.connection.readyState;

  res.status(200).json({
    success: true,
    platform: 'FoodBridge API',
    status: 'Healthy',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())} seconds`,
    database: {
      status: dbStates[dbState] || 'Unknown',
      readyState: dbState,
    },
    version: '1.0.0',
  });
});

export default router;

