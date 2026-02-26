import { Router } from 'express';

import {
  loginController,
  logoutController,
  refreshController,
  registerController,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/authMiddleware';
import { validateResource } from '../middleware/validateResource';
import { loginSchema, registerSchema } from '../types/auth';

const router = Router();

router.post('/register', validateResource(registerSchema), registerController);
router.post('/login', validateResource(loginSchema), loginController);
router.post('/refresh', refreshController);
router.post('/logout', authenticate, logoutController);

export default router;
