import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/authRoutes.js';
import donationRoutes from './routes/donationRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import deliveryRoutes from './routes/deliveryRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import healthRoutes from './routes/health.routes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

// Security Headers with Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// Rate Limiting (300 requests per 15 minutes per IP for general API)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: {
    success: false,
    message: 'Too many requests from this IP address, please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// CORS setup
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: [allowedOrigin, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Root welcome route
app.get('/', (req, res) => {
  res.json({
    platform: 'FoodBridge API',
    description: 'Smart Food Donation and Redistribution Platform',
    status: 'Online',
    healthCheck: '/api/health',
  });
});

// Mount Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

export default app;
