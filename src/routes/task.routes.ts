import { Router } from 'express';
import {
  getTasks,
  createTask,
  toggleTaskDone,
  deleteTask
} from '../controllers/task.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createTaskSchema } from '../validators/task.validator.js';

const router = Router();

router.get('/', getTasks);
router.post('/', validate({ body: createTaskSchema }), createTask);
router.patch('/:id/toggle', toggleTaskDone);
router.delete('/:id', deleteTask);

export default router;

