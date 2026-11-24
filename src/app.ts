import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import apiRouter from './routes/index.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { notFoundHandler } from './middlewares/notFound.middleware.js';
import { env } from './config/env.js';

export const createApp = (): Application => {
  const app = express();

  // 1. Security Headers
  app.use(helmet());

  // 2. CORS Configuration
  const allowedOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim());
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, Postman)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || env.NODE_ENV === 'development') {
          return callback(null, true);
        }
        return callback(new Error('Blocked by CORS policy'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    })
  );

  // 3. Body Parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // 4. Request Logging
  if (env.NODE_ENV !== 'test') {
    app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
  }

  // 5. Rate Limiting for Auth
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      statusCode: 429,
      message: 'Too many login/registration attempts, please try again later.'
    }
  });
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);

  // 6. Central API Routes
  app.use('/api', apiRouter);

  // 7. 404 Not Found Handler
  app.use(notFoundHandler);

  // 8. Central Error Handler
  app.use(errorHandler);

  return app;
};

