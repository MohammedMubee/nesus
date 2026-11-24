import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ContactService } from '../services/contact.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const getContacts = asyncHandler(async (_req: Request, res: Response) => {
  const contacts = await ContactService.getAll();
  res.status(200).json(ApiResponse.ok(contacts));
});

export const getContactById = asyncHandler(async (req: Request, res: Response) => {
  const contact = await ContactService.getById(String(req.params.id));
  res.status(200).json(ApiResponse.ok(contact));
});

export const createContact = asyncHandler(async (req: Request, res: Response) => {
  const contact = await ContactService.create(req.body);
  res.status(201).json(ApiResponse.created(contact, 'Contact created successfully'));
});

export const updateContact = asyncHandler(async (req: Request, res: Response) => {
  const contact = await ContactService.update(String(req.params.id), req.body);
  res.status(200).json(ApiResponse.ok(contact, 'Contact updated successfully'));
});

export const updateLifecycleStage = asyncHandler(async (req: Request, res: Response) => {
  const contact = await ContactService.updateLifecycleStage(String(req.params.id), req.body.lifecycleStage);
  res.status(200).json(ApiResponse.ok(contact, 'Contact lifecycle stage updated'));
});

export const deleteContact = asyncHandler(async (req: Request, res: Response) => {
  await ContactService.delete(String(req.params.id));
  res.status(200).json(ApiResponse.ok(null, 'Contact deleted successfully'));
});
