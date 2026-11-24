import { Router } from 'express';
import {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  convertLead
} from '../controllers/lead.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createLeadSchema, updateLeadSchema } from '../validators/lead.validator.js';

const router = Router();

router.get('/', getLeads);
router.get('/:id', getLeadById);
router.post('/', validate({ body: createLeadSchema }), createLead);
router.put('/:id', validate({ body: updateLeadSchema }), updateLead);
router.delete('/:id', deleteLead);
router.post('/:id/convert', convertLead);

export default router;

