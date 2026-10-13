import { Router } from 'express';
import { z } from 'zod';
import * as ctrl from '../controllers/public.controller';
import { asyncHandler } from '../utils/async';
import { validate } from '../middleware/validate';
import { publicOrderLimiter } from '../middleware/rateLimit';
import * as tables from '../controllers/table.controller';

const router = Router();

const qrTokenParam = z.object({ qrToken: z.string().uuid() });

router.get('/tables/:qrToken/qr.png', validate({ params: qrTokenParam }), asyncHandler(tables.qrPng));
router.get('/menu/:qrToken', validate({ params: qrTokenParam }), asyncHandler(ctrl.getMenu));
router.get('/tables/:qrToken/orders', validate({ params: qrTokenParam }), asyncHandler(ctrl.getTableSession));

router.post(
  '/tables/:qrToken/orders',
  publicOrderLimiter,
  validate({
    params: qrTokenParam,
    body: z.object({
      customerName: z.string().max(80).optional(),
      customerPhone: z.string().max(30).optional(),
      note: z.string().max(300).optional(),
      items: z
        .array(
          z.object({
            menuItemId: z.string().min(1),
            quantity: z.number().int().min(1).max(50),
            note: z.string().max(200).optional(),
          }),
        )
        .min(1)
        .max(50),
    }),
  }),
  asyncHandler(ctrl.createOrder),
);

router.get(
  '/orders/:orderId',
  validate({ params: z.object({ orderId: z.string().uuid() }) }),
  asyncHandler(ctrl.getOrder),
);

router.post('/tables/:qrToken/call-waiter', publicOrderLimiter, validate({ params: qrTokenParam }), asyncHandler(ctrl.callWaiter));
router.post('/tables/:qrToken/request-bill', publicOrderLimiter, validate({ params: qrTokenParam }), asyncHandler(ctrl.requestBill));

export default router;