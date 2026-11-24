import { Router } from 'express';
import {
  getQuotes,
  getQuoteById,
  createQuote,
  updateQuoteStatus,
  acceptQuote,
  deleteQuote
} from '../controllers/quote.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createQuoteSchema, updateQuoteStatusSchema } from '../validators/quote.validator.js';

const router = Router();

router.get('/', getQuotes);
router.get('/:id', getQuoteById);
router.post('/', validate({ body: createQuoteSchema }), createQuote);
router.patch('/:id/status', validate({ body: updateQuoteStatusSchema }), updateQuoteStatus);
router.post('/:id/accept', acceptQuote);
router.delete('/:id', deleteQuote);

export default router;

