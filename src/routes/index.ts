import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import authRoutes from './auth.routes.js';
import companyRoutes from './company.routes.js';
import contactRoutes from './contact.routes.js';
import leadRoutes from './lead.routes.js';
import dealRoutes from './deal.routes.js';
import quoteRoutes from './quote.routes.js';
import taskRoutes from './task.routes.js';
import ticketRoutes from './ticket.routes.js';
import activityRoutes from './activity.routes.js';
import analyticsRoutes from './analytics.routes.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const router = Router();

// Health Check
router.get('/health', (_req: Request, res: Response) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.status(200).json(
    ApiResponse.ok({
      status: 'healthy',
      database: isDbConnected ? 'connected' : 'connecting',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    }, 'NexusCRM API is operational')
  );
});

// Modular Routes
router.use('/auth', authRoutes);
router.use('/companies', companyRoutes);
router.use('/contacts', contactRoutes);
router.use('/leads', leadRoutes);
router.use('/deals', dealRoutes);
router.use('/quotes', quoteRoutes);
router.use('/tasks', taskRoutes);
router.use('/tickets', ticketRoutes);
router.use('/activities', activityRoutes);
router.use('/analytics', analyticsRoutes);

export default router;

