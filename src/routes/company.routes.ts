import { Router } from 'express';
import {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany
} from '../controllers/company.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createCompanySchema, updateCompanySchema } from '../validators/company.validator.js';

const router = Router();

router.get('/', getCompanies);
router.get('/:id', getCompanyById);
router.post('/', validate({ body: createCompanySchema }), createCompany);
router.put('/:id', validate({ body: updateCompanySchema }), updateCompany);
router.delete('/:id', deleteCompany);

export default router;

