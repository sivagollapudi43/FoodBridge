import dotenv from 'dotenv';

// Load environment variables before initializing app and db
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Start Server
const server = app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(` FoodBridge Backend Server Running`);
  console.log(` Port:    ${PORT}`);
  console.log(` Mode:    ${process.env.NODE_ENV || 'development'}`);
  console.log(` Health:  http://localhost:${PORT}/api/health`);
  console.log(`===============================================`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
});

