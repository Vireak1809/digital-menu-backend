import { Router } from 'express';
import * as orders from '../controllers/order.controller';
import { asyncHandler } from '../utils/async';
import { requireAuth, requireRole } from '../middleware/auth';
import { ok } from '../utils/response';
import { prisma } from '../config/prisma';

const router = Router();
router.use(requireAuth, requireRole('CHEF', 'ADMIN'));

/** Kitchen board: everything not yet completed/cancelled. */
router.get('/board', asyncHandler(async (_req, res) => {
  const board = await prisma.order.findMany({
    where: { status: { in: ['PENDING', 'ACCEPTED', 'PREPARING', 'READY'] } },
    orderBy: { createdAt: 'asc' },
    include: { table: { select: { id: true, number: true, name: true } }, items: true },
  });
  return ok(res, board);
}));

router.get('/history', asyncHandler(async (_req, res) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const history = await prisma.order.findMany({
    where: { createdAt: { gte: start }, status: { in: ['SERVED', 'COMPLETED', 'CANCELLED'] } },
    orderBy: { updatedAt: 'desc' },
    include: { table: { select: { id: true, number: true } }, items: true },
  });
  return ok(res, history);
}));

export default router;