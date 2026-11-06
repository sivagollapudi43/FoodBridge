import express from 'express';
import cors from 'cors';
import healthRoutes from './routes/health.routes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

// Middleware
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: [allowedOrigin, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to FoodBridge API - Smart Food Donation and Redistribution Platform',
    healthCheck: '/api/health',
  });
});

// Routes
app.use('/api/health', healthRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

export default app;

