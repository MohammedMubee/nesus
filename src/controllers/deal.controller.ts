import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { DealService } from '../services/deal.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const getDeals = asyncHandler(async (_req: Request, res: Response) => {
  const deals = await DealService.getAll();
  res.status(200).json(ApiResponse.ok(deals));
});

export const getDealById = asyncHandler(async (req: Request, res: Response) => {
  const deal = await DealService.getById(String(req.params.id));
  res.status(200).json(ApiResponse.ok(deal));
});

export const createDeal = asyncHandler(async (req: Request, res: Response) => {
  const deal = await DealService.create(req.body);
  res.status(201).json(ApiResponse.created(deal, 'Deal created successfully'));
});

export const updateDeal = asyncHandler(async (req: Request, res: Response) => {
  const deal = await DealService.update(String(req.params.id), req.body);
  res.status(200).json(ApiResponse.ok(deal, 'Deal updated successfully'));
});

export const updateDealStage = asyncHandler(async (req: Request, res: Response) => {
  const result = await DealService.updateStage(String(req.params.id), req.body.stage);
  res.status(200).json(ApiResponse.ok(result, 'Deal stage updated'));
});

export const deleteDeal = asyncHandler(async (req: Request, res: Response) => {
  await DealService.delete(String(req.params.id));
  res.status(200).json(ApiResponse.ok(null, 'Deal deleted successfully'));
});
