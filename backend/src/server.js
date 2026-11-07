import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Start Server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(` 🥗 FoodBridge Server Running`);
  console.log(` 🌐 Port:    ${PORT}`);
  console.log(` 🚀 Health:  http://localhost:${PORT}/api/health`);
  console.log(`===============================================`);
});
