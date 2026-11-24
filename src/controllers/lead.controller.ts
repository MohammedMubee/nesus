import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { LeadService } from '../services/lead.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const getLeads = asyncHandler(async (_req: Request, res: Response) => {
  const leads = await LeadService.getAll();
  res.status(200).json(ApiResponse.ok(leads));
});

export const getLeadById = asyncHandler(async (req: Request, res: Response) => {
  const lead = await LeadService.getById(String(req.params.id));
  res.status(200).json(ApiResponse.ok(lead));
});

export const createLead = asyncHandler(async (req: Request, res: Response) => {
  const lead = await LeadService.create(req.body);
  res.status(201).json(ApiResponse.created(lead, 'Lead created successfully'));
});

export const updateLead = asyncHandler(async (req: Request, res: Response) => {
  const lead = await LeadService.update(String(req.params.id), req.body);
  res.status(200).json(ApiResponse.ok(lead, 'Lead updated successfully'));
});

export const deleteLead = asyncHandler(async (req: Request, res: Response) => {
  await LeadService.delete(String(req.params.id));
  res.status(200).json(ApiResponse.ok(null, 'Lead deleted successfully'));
});

export const convertLead = asyncHandler(async (req: Request, res: Response) => {
  const result = await LeadService.convertLead(String(req.params.id));
  res.status(200).json(ApiResponse.ok(result, 'Lead successfully converted to Contact & Company'));
});
