import http from 'http';
import dotenv from 'dotenv';

// Load environment variables before initializing app and db
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';
import { initSocket } from './sockets/socketHandler.js';

const PORT = process.env.PORT || 5000;
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';

// Connect to Database
connectDB();

// Create HTTP server instance
const httpServer = http.createServer(app);

// Initialize Socket.IO engine
initSocket(httpServer, allowedOrigin);

// Start Server
httpServer.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` 🥗 FoodBridge Full-Stack Server Running`);
  console.log(` 🌐 Port:      ${PORT}`);
  console.log(` 🚀 Mode:      ${process.env.NODE_ENV || 'development'}`);
  console.log(` ⚡ Socket.IO: Active and listening`);
  console.log(` 🩺 Health:    http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
});
