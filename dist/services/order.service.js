"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrder = createOrder;
exports.getOrderById = getOrderById;
exports.listOrders = listOrders;
exports.updateOrderStatus = updateOrderStatus;
exports.updateOrderItemStatus = updateOrderItemStatus;
exports.requestWaiter = requestWaiter;
exports.todayStats = todayStats;
const prisma_1 = require("../config/prisma");
const errors_1 = require("../utils/errors");
const settings_service_1 = require("./settings.service");
const emitter_1 = require("../sockets/emitter");
const ORDER_INCLUDE = {
    table: { select: { id: true, number: true, name: true } },
    items: true,
};
async function generateOrderNumber() {
    const now = new Date();
    const stamp = `${now.getFullYear().toString().slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    for (let i = 0; i < 6; i++) {
        const candidate = `#${stamp}-${Math.floor(1000 + Math.random() * 9000)}`;
        const exists = await prisma_1.prisma.order.findUnique({ where: { orderNumber: candidate }, select: { id: true } });
        if (!exists)
            return candidate;
    }
    return `#${stamp}-${Date.now().toString().slice(-6)}`;
}
async function createOrder(input) {
    if (!input.items.length)
        throw (0, errors_1.badRequest)('Cart is empty');
    const table = await prisma_1.prisma.table.findUnique({ where: { qrToken: input.qrToken } });
    if (!table)
        throw (0, errors_1.notFound)('Invalid table QR code');
    const ids = [...new Set(input.items.map((i) => i.menuItemId))];
    const menuItems = await prisma_1.prisma.menuItem.findMany({
        where: { id: { in: ids }, isAvailable: true },
        include: { category: { select: { isActive: true } } },
    });
    const byId = new Map(menuItems.map((m) => [m.id, m]));
    for (const line of input.items) {
        const item = byId.get(line.menuItemId);
        if (!item)
            throw (0, errors_1.badRequest)('One or more items are unavailable');
        if (!item.category.isActive)
            throw (0, errors_1.badRequest)(`${item.name} is not currently served`);
    }
    const settings = await (0, settings_service_1.getSettings)();
    const subtotal = input.items.reduce((sum, line) => {
        const item = byId.get(line.menuItemId);
        return sum + Number(item.price) * line.quantity;
    }, 0);
    const taxAmount = round2((subtotal * settings.taxPercent) / 100);
    const serviceAmount = round2((subtotal * settings.serviceChargePercent) / 100);
    const totalAmount = round2(subtotal + taxAmount + serviceAmount);
    const orderNumber = await generateOrderNumber();
    const order = await prisma_1.prisma.$transaction(async (tx) => {
        const created = await tx.order.create({
            data: {
                orderNumber,
                tableId: table.id,
                customerName: input.customerName?.trim() || null,
                customerPhone: input.customerPhone?.trim() || null,
                note: input.note?.trim() || null,
                subtotal,
                taxAmount,
                serviceAmount,
                totalAmount,
                items: {
                    create: input.items.map((line) => {
                        const item = byId.get(line.menuItemId);
                        return {
                            menuItemId: item.id,
                            name: item.name,
                            quantity: line.quantity,
                            unitPrice: item.price,
                            note: line.note?.trim() || null,
                        };
                    }),
                },
            },
            include: ORDER_INCLUDE,
        });
        await tx.table.update({ where: { id: table.id }, data: { status: 'OCCUPIED' } });
        return created;
    });
    (0, emitter_1.emitToRoom)('chef', 'order:new', order);
    (0, emitter_1.emitToRoom)('admin', 'order:new', order);
    (0, emitter_1.emitToRoom)(`table:${table.id}`, 'order:statusChanged', { orderId: order.id, status: order.status });
    (0, emitter_1.emitToRoom)('admin', 'table:statusChanged', { tableId: table.id, status: 'OCCUPIED' });
    return order;
}
async function getOrderById(id) {
    const order = await prisma_1.prisma.order.findUnique({ where: { id }, include: ORDER_INCLUDE });
    if (!order)
        throw (0, errors_1.notFound)('Order not found');
    return order;
}
async function listOrders(filters) {
    return prisma_1.prisma.order.findMany({
        where: {
            ...(filters.status ? { status: filters.status } : {}),
            ...(filters.tableId ? { tableId: filters.tableId } : {}),
            ...(filters.active
                ? { status: { in: ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED'] } }
                : {}),
            ...(filters.from || filters.to
                ? {
                    createdAt: {
                        ...(filters.from ? { gte: new Date(filters.from) } : {}),
                        ...(filters.to ? { lte: new Date(filters.to) } : {}),
                    },
                }
                : {}),
        },
        orderBy: { createdAt: 'desc' },
        take: filters.limit ?? 100,
        include: ORDER_INCLUDE,
    });
}
const TRANSITIONS = {
    PENDING: ['ACCEPTED', 'CANCELLED'],
    ACCEPTED: ['PREPARING', 'CANCELLED'],
    PREPARING: ['READY', 'CANCELLED'],
    READY: ['SERVED', 'CANCELLED'],
    SERVED: ['COMPLETED', 'CANCELLED'],
    COMPLETED: [],
    CANCELLED: [],
};
async function updateOrderStatus(id, status, cancelReason) {
    const order = await prisma_1.prisma.order.findUnique({ where: { id }, include: ORDER_INCLUDE });
    if (!order)
        throw (0, errors_1.notFound)('Order not found');
    if (order.status === status)
        return order;
    const transitions = TRANSITIONS[order.status] ?? [];
    if (!transitions.includes(status)) {
        throw (0, errors_1.badRequest)(`Cannot move order from ${order.status} to ${status}`);
    }
    const itemStatus = status === 'PREPARING' ? 'PREPARING' : status === 'READY' ? 'READY' : status === 'SERVED' ? 'SERVED' : undefined;
    const updated = await prisma_1.prisma.$transaction(async (tx) => {
        const next = await tx.order.update({
            where: { id },
            data: { status, ...(cancelReason ? { cancelReason } : {}) },
            include: ORDER_INCLUDE,
        });
        if (itemStatus) {
            await tx.orderItem.updateMany({ where: { orderId: id }, data: { itemStatus } });
        }
        if (status === 'COMPLETED' || status === 'CANCELLED') {
            const remaining = await tx.order.count({
                where: {
                    tableId: order.tableId,
                    status: { in: ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED'] },
                },
            });
            if (remaining === 0) {
                await tx.table.update({ where: { id: order.tableId }, data: { status: 'FREE' } });
                (0, emitter_1.emitToRoom)('admin', 'table:statusChanged', { tableId: order.tableId, status: 'FREE' });
            }
        }
        return next;
    });
    (0, emitter_1.emitToRoom)('admin', 'order:statusChanged', { orderId: id, status });
    (0, emitter_1.emitToRoom)('chef', 'order:statusChanged', { orderId: id, status });
    (0, emitter_1.emitToRoom)(`table:${order.tableId}`, 'order:statusChanged', { orderId: id, status });
    return updated;
}
async function updateOrderItemStatus(orderId, itemId, status) {
    const item = await prisma_1.prisma.orderItem.findFirst({ where: { id: itemId, orderId } });
    if (!item)
        throw (0, errors_1.notFound)('Order item not found');
    const updated = await prisma_1.prisma.orderItem.update({ where: { id: itemId }, data: { itemStatus: status } });
    (0, emitter_1.emitToRoom)('chef', 'order:itemStatusChanged', { orderId, itemId, status });
    (0, emitter_1.emitToRoom)('admin', 'order:itemStatusChanged', { orderId, itemId, status });
    return updated;
}
async function requestWaiter(qrToken, type) {
    const table = await prisma_1.prisma.table.findUnique({ where: { qrToken } });
    if (!table)
        throw (0, errors_1.notFound)('Invalid table QR code');
    (0, emitter_1.emitToRoom)('admin', type === 'waiter' ? 'waiter:called' : 'bill:requested', {
        tableId: table.id,
        tableNumber: table.number,
        at: new Date().toISOString(),
    });
    return { tableId: table.id, type };
}
async function todayStats() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const [orders, revenueAgg, activeTables, topItems] = await Promise.all([
        prisma_1.prisma.order.count({ where: { createdAt: { gte: start } } }),
        prisma_1.prisma.order.aggregate({
            where: { createdAt: { gte: start }, status: { not: 'CANCELLED' } },
            _sum: { totalAmount: true },
        }),
        prisma_1.prisma.table.count({ where: { status: 'OCCUPIED' } }),
        prisma_1.prisma.orderItem.groupBy({
            by: ['name'],
            where: { order: { createdAt: { gte: start }, status: { not: 'CANCELLED' } } },
            _sum: { quantity: true },
            orderBy: { _sum: { quantity: 'desc' } },
            take: 5,
        }),
    ]);
    return {
        ordersToday: orders,
        revenueToday: Number(revenueAgg._sum.totalAmount ?? 0),
        activeTables,
        topItems: topItems.map((t) => ({ name: t.name, quantity: t._sum.quantity ?? 0 })),
    };
}
function round2(n) {
    return Math.round(n * 100) / 100;
}
