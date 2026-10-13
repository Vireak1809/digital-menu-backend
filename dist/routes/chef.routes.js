"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const async_1 = require("../utils/async");
const auth_1 = require("../middleware/auth");
const response_1 = require("../utils/response");
const prisma_1 = require("../config/prisma");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth, (0, auth_1.requireRole)('CHEF', 'ADMIN'));
/** Kitchen board: everything not yet completed/cancelled. */
router.get('/board', (0, async_1.asyncHandler)(async (_req, res) => {
    const board = await prisma_1.prisma.order.findMany({
        where: { status: { in: ['PENDING', 'ACCEPTED', 'PREPARING', 'READY'] } },
        orderBy: { createdAt: 'asc' },
        include: { table: { select: { id: true, number: true, name: true } }, items: true },
    });
    return (0, response_1.ok)(res, board);
}));
router.get('/history', (0, async_1.asyncHandler)(async (_req, res) => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const history = await prisma_1.prisma.order.findMany({
        where: { createdAt: { gte: start }, status: { in: ['SERVED', 'COMPLETED', 'CANCELLED'] } },
        orderBy: { updatedAt: 'desc' },
        include: { table: { select: { id: true, number: true } }, items: true },
    });
    return (0, response_1.ok)(res, history);
}));
exports.default = router;
