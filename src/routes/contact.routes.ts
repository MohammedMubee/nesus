import { Router } from 'express';
import {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  updateLifecycleStage,
  deleteContact
} from '../controllers/contact.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createContactSchema,
  updateContactSchema,
  updateLifecycleSchema
} from '../validators/contact.validator.js';

const router = Router();

router.get('/', getContacts);
router.get('/:id', getContactById);
router.post('/', validate({ body: createContactSchema }), createContact);
router.put('/:id', validate({ body: updateContactSchema }), updateContact);
router.patch('/:id/lifecycle', validate({ body: updateLifecycleSchema }), updateLifecycleStage);
router.delete('/:id', deleteContact);

export default router;

