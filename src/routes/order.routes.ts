import { Router } from 'express';
import { z } from 'zod';
import * as orders from '../controllers/order.controller';
import { asyncHandler } from '../utils/async';
import { validate } from '../middleware/validate';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();
router.use(requireAuth, requireRole('ADMIN', 'STAFF', 'CHEF'));

const statusEnum = z.enum(['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED', 'CANCELLED']);
const itemStatusEnum = z.enum(['PENDING', 'PREPARING', 'READY', 'SERVED', 'CANCELLED']);

router.get('/', validate({
  query: z.object({
    status: statusEnum.optional(),
    tableId: z.string().uuid().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
    active: z.enum(['true', 'false']).optional(),
    limit: z.coerce.number().int().min(1).max(500).optional(),
  }).partial(),
}), asyncHandler(orders.list));

router.get('/stats/today', asyncHandler(orders.stats));
router.get('/:id', asyncHandler(orders.get));

router.patch('/:id/status', validate({
  body: z.object({ status: statusEnum, cancelReason: z.string().max(200).optional() }),
}), asyncHandler(orders.updateStatus));

router.patch('/:id/items/:itemId/status', validate({
  body: z.object({ status: itemStatusEnum }),
}), asyncHandler(orders.updateItemStatus));

// Kitchen & floor staff can 86 an item without touching the admin panel.
router.patch('/menu-items/:id/availability', validate({
  body: z.object({ isAvailable: z.boolean() }),
}), asyncHandler(orders.toggleAvailability));

export default router;