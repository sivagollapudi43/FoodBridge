import 'dotenv/config';
import mongoose from 'mongoose';
import dns from 'dns';

/**
 * Configure DNS fallback for MongoDB SRV records on Windows networks
 */
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (err) {
  // Ignore if custom DNS cannot be set
}

/**
 * Establishes connection to MongoDB database
 */
export const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/foodbridge';

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 8000,
    });

    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
    console.log(`[MongoDB] Database Name: ${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB Connection Error] ${error.message}`);
    console.warn(
      `[MongoDB] Tip: Ensure MongoDB service is running locally on 127.0.0.1:27017 or provide a valid MongoDB Atlas connection string in 'backend/.env'.`
    );
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB] Database connection disconnected.');
});

mongoose.connection.on('reconnected', () => {
  console.log('[MongoDB] Database reconnected.');
});
