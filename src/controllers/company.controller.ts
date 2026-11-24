import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { CompanyService } from '../services/company.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const getCompanies = asyncHandler(async (_req: Request, res: Response) => {
  const companies = await CompanyService.getAll();
  res.status(200).json(ApiResponse.ok(companies));
});

export const getCompanyById = asyncHandler(async (req: Request, res: Response) => {
  const company = await CompanyService.getById(String(req.params.id));
  res.status(200).json(ApiResponse.ok(company));
});

export const createCompany = asyncHandler(async (req: Request, res: Response) => {
  const company = await CompanyService.create(req.body);
  res.status(201).json(ApiResponse.created(company, 'Company created successfully'));
});

export const updateCompany = asyncHandler(async (req: Request, res: Response) => {
  const company = await CompanyService.update(String(req.params.id), req.body);
  res.status(200).json(ApiResponse.ok(company, 'Company updated successfully'));
});

export const deleteCompany = asyncHandler(async (req: Request, res: Response) => {
  await CompanyService.delete(String(req.params.id));
  res.status(200).json(ApiResponse.ok(null, 'Company deleted successfully'));
});
