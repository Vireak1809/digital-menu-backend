import { Router } from 'express';
import { z } from 'zod';
import * as ctrl from '../controllers/auth.controller';
import { asyncHandler } from '../utils/async';
import { validate } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimit';

const router = Router();

router.get('/setup-status', asyncHandler(ctrl.initialAdminSetupStatus));
router.post(
  '/setup-admin',
  authLimiter,
  validate({
    body: z.object({
      name: z.string().trim().min(1).max(120),
      email: z.string().trim().email(),
      password: z.string().min(16).max(128),
      setupKey: z.string().min(32).max(512),
    }),
  }),
  asyncHandler(ctrl.createInitialAdmin),
);
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