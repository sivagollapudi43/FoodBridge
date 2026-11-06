import mongoose from 'mongoose';

/**
 * Establishes connection to MongoDB database
 */
export const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/foodbridge';

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of hanging
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

