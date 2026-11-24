import dns from 'node:dns';
import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

// Resolve SRV records reliably across Windows/ISP environments
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore if custom DNS cannot be set
}

let isConnecting = false;

export const connectDB = async (): Promise<typeof mongoose | null> => {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }
  if (isConnecting) return null;

  isConnecting = true;
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000
    });
    logger.info(`🍃 MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    isConnecting = false;
    return conn;
  } catch (error: any) {
    isConnecting = false;
    logger.error('❌ MongoDB Connection Error:', error?.message || error);
    logger.warn('⚠️  TIP: If you see "SSL routines:tlsv1 alert internal error" or "MongooseServerSelectionError",');
    logger.warn('   ensure your current IP is whitelisted in MongoDB Atlas -> Network Access (or add 0.0.0.0/0).');
    
    // Auto-retry connection every 8 seconds in the background
    setTimeout(() => {
      if (mongoose.connection.readyState !== 1) {
        logger.info('🔄 Retrying MongoDB connection in background...');
        connectDB();
      }
    }, 8000);
    return null;
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected.');
  } catch (error) {
    logger.error('Error disconnecting MongoDB:', error);
  }
};
