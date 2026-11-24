import { Router } from 'express';
import {
  getDeals,
  getDealById,
  createDeal,
  updateDeal,
  updateDealStage,
  deleteDeal
} from '../controllers/deal.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createDealSchema,
  updateDealSchema,
  updateDealStageSchema
} from '../validators/deal.validator.js';

const router = Router();

router.get('/', getDeals);
router.get('/:id', getDealById);
router.post('/', validate({ body: createDealSchema }), createDeal);
router.put('/:id', validate({ body: updateDealSchema }), updateDeal);
router.patch('/:id/stage', validate({ body: updateDealStageSchema }), updateDealStage);
router.delete('/:id', deleteDeal);

export default router;

