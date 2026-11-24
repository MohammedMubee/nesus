import { createApp } from './app.js';
import { env } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { logger } from './utils/logger.js';

const startServer = async () => {
  // Attempt MongoDB connection in background so server starts immediately
  connectDB().catch((err) => {
    logger.warn('Initial MongoDB connection deferred:', err?.message || err);
  });

  const app = createApp();

  const server = app.listen(env.PORT, () => {
    logger.info(`🚀 NexusCRM Backend API running in [${env.NODE_ENV}] mode on port ${env.PORT}`);
    logger.info(`👉 API Health Check: http://localhost:${env.PORT}/api/health`);
  });

  // Graceful Shutdown Handlers
  const handleShutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      logger.info('HTTP server closed.');
      await disconnectDB();
      logger.info('MongoDB database client disconnected.');
      process.exit(0);
    });

    setTimeout(() => {
      logger.error('Forcefully terminating process after timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
};

startServer().catch((err) => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});
