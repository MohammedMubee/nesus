import { Router } from 'express';
import {
  getTickets,
  createTicket,
  updateTicketStatus,
  deleteTicket
} from '../controllers/ticket.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createTicketSchema } from '../validators/ticket.validator.js';

const router = Router();

router.get('/', getTickets);
router.post('/', validate({ body: createTicketSchema }), createTicket);
router.patch('/:id/status', updateTicketStatus);
router.delete('/:id', deleteTicket);

export default router;

