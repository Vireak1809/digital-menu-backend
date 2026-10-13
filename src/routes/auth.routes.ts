import { Router } from 'express';
import { z } from 'zod';
import * as ctrl from '../controllers/auth.controller';
import { asyncHandler } from '../utils/async';
import { validate } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimit';

const router = Router();

router.post(
  '/login',
  authLimiter,
  validate({ body: z.object({ email: z.string().email(), password: z.string().min(1) }) }),
  asyncHandler(ctrl.login),
);
router.post('/refresh', asyncHandler(ctrl.refresh));
router.post('/logout', requireAuth, asyncHandler(ctrl.logout));
router.get('/me', requireAuth, asyncHandler(ctrl.me));

export default router;