import { Router } from 'express';
import { register, login, getMe } from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { registerSchema, loginSchema } from '../validators/auth.validator.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', validate({ body: registerSchema }), register);
router.post('/login', validate({ body: loginSchema }), login);
router.get('/me', authenticate, getMe);

export default router;

