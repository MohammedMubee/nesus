import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { QuoteService } from '../services/quote.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const getQuotes = asyncHandler(async (_req: Request, res: Response) => {
  const quotes = await QuoteService.getAll();
  res.status(200).json(ApiResponse.ok(quotes));
});

export const getQuoteById = asyncHandler(async (req: Request, res: Response) => {
  const quote = await QuoteService.getById(String(req.params.id));
  res.status(200).json(ApiResponse.ok(quote));
});

export const createQuote = asyncHandler(async (req: Request, res: Response) => {
  const quote = await QuoteService.create(req.body);
  res.status(201).json(ApiResponse.created(quote, 'Quote created successfully'));
});

export const updateQuoteStatus = asyncHandler(async (req: Request, res: Response) => {
  const result = await QuoteService.updateStatus(String(req.params.id), req.body.status);
  res.status(200).json(ApiResponse.ok(result, 'Quote status updated'));
});

export const acceptQuote = asyncHandler(async (req: Request, res: Response) => {
  const result = await QuoteService.acceptQuote(String(req.params.id));
  res.status(200).json(ApiResponse.ok(result, 'Quote accepted! Deal WON and Contact promoted.'));
});

export const deleteQuote = asyncHandler(async (req: Request, res: Response) => {
  await QuoteService.delete(String(req.params.id));
  res.status(200).json(ApiResponse.ok(null, 'Quote deleted successfully'));
});
