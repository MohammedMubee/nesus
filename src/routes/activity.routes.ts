import { Router } from 'express';
import { getActivities, createActivity } from '../controllers/activity.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createActivitySchema } from '../validators/activity.validator.js';

const router = Router();

router.get('/', getActivities);
router.post('/', validate({ body: createActivitySchema }), createActivity);

export default router;

