import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AnalyticsService } from '../services/analytics.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const getOverview = asyncHandler(async (_req: Request, res: Response) => {
  const data = await AnalyticsService.getOverview();
  res.status(200).json(ApiResponse.ok(data));
});

