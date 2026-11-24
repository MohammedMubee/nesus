import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ActivityService } from '../services/activity.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const getActivities = asyncHandler(async (req: Request, res: Response) => {
  const { contactId, dealId } = req.query;
  const activities = await ActivityService.getAll({
    contactId: typeof contactId === 'string' ? contactId : undefined,
    dealId: typeof dealId === 'string' ? dealId : undefined
  });
  res.status(200).json(ApiResponse.ok(activities));
});

export const createActivity = asyncHandler(async (req: Request, res: Response) => {
  const activity = await ActivityService.create(req.body);
  res.status(201).json(ApiResponse.created(activity, 'Activity logged successfully'));
});

