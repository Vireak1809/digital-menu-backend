import rateLimit from 'express-rate-limit';

export const publicOrderLimiter = rateLimit({
  windowMs: 60_000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, data: null, message: 'Too many requests, slow down.', errors: null },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, data: null, message: 'Too many login attempts.', errors: null },
});