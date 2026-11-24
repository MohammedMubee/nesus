import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { TicketService } from '../services/ticket.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const getTickets = asyncHandler(async (_req: Request, res: Response) => {
  const tickets = await TicketService.getAll();
  res.status(200).json(ApiResponse.ok(tickets));
});

export const createTicket = asyncHandler(async (req: Request, res: Response) => {
  const ticket = await TicketService.create(req.body);
  res.status(201).json(ApiResponse.created(ticket, 'Support ticket created successfully'));
});

export const updateTicketStatus = asyncHandler(async (req: Request, res: Response) => {
  const ticket = await TicketService.updateStatus(String(req.params.id), req.body.status);
  res.status(200).json(ApiResponse.ok(ticket, 'Ticket status updated'));
});

export const deleteTicket = asyncHandler(async (req: Request, res: Response) => {
  await TicketService.delete(String(req.params.id));
  res.status(200).json(ApiResponse.ok(null, 'Ticket deleted successfully'));
});
