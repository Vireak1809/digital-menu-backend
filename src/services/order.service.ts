import { prisma } from '../config/prisma';
import { badRequest, notFound } from '../utils/errors';
import { getSettings } from './settings.service';
import { emitToRoom } from '../sockets/emitter';
import type { OrderStatus, OrderItemStatus } from '@prisma/client';

const ORDER_INCLUDE = {
  table: { select: { id: true, number: true, name: true } },
  items: true,
} as const;

async function generateOrderNumber() {
  const now = new Date();
  const stamp = `${now.getFullYear().toString().slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(
    now.getDate(),
  ).padStart(2, '0')}`;
  for (let i = 0; i < 6; i++) {
    const candidate = `#${stamp}-${Math.floor(1000 + Math.random() * 9000)}`;
    const exists = await prisma.order.findUnique({ where: { orderNumber: candidate }, select: { id: true } });
    if (!exists) return candidate;
  }
  return `#${stamp}-${Date.now().toString().slice(-6)}`;
}

export interface CreateOrderInput {
  qrToken: string;
  customerName?: string;
  customerPhone?: string;
  note?: string;
  items: { menuItemId: string; quantity: number; note?: string }[];
}

export async function createOrder(input: CreateOrderInput) {
  if (!input.items.length) throw badRequest('Cart is empty');

  const table = await prisma.table.findUnique({ where: { qrToken: input.qrToken } });
  if (!table) throw notFound('Invalid table QR code');

  const ids = [...new Set(input.items.map((i) => i.menuItemId))];
  const menuItems: any[] = await prisma.menuItem.findMany({
    where: { id: { in: ids }, isAvailable: true },
    include: { category: { select: { isActive: true } } },
  });

  const byId = new Map(menuItems.map((m: any) => [m.id, m]));
  for (const line of input.items) {
    const item: any = byId.get(line.menuItemId);
    if (!item) throw badRequest('One or more items are unavailable');
    if (!item.category.isActive) throw badRequest(`${item.name} is not currently served`);
  }

  const settings = await getSettings();
  const subtotal = input.items.reduce((sum, line) => {
    const item = byId.get(line.menuItemId)!;
    return sum + Number(item.price) * line.quantity;
  }, 0);
  const taxAmount = round2((subtotal * settings.taxPercent) / 100);
  const serviceAmount = round2((subtotal * settings.serviceChargePercent) / 100);
  const totalAmount = round2(subtotal + taxAmount + serviceAmount);

  const orderNumber = await generateOrderNumber();

  const order = await prisma.$transaction(async (tx: any) => {
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
            const item: any = byId.get(line.menuItemId)!;
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

  emitToRoom('chef', 'order:new', order);
  emitToRoom('admin', 'order:new', order);
  emitToRoom(`table:${table.id}`, 'order:statusChanged', { orderId: order.id, status: order.status });
  emitToRoom('admin', 'table:statusChanged', { tableId: table.id, status: 'OCCUPIED' });

  return order;
}

export async function getOrderById(id: string) {
  const order = await prisma.order.findUnique({ where: { id }, include: ORDER_INCLUDE });
  if (!order) throw notFound('Order not found');
  return order;
}

export async function listOrders(filters: {
  status?: OrderStatus;
  tableId?: string;
  from?: string;
  to?: string;
  active?: boolean;
  limit?: number;
}) {
  return prisma.order.findMany({
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

const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['ACCEPTED', 'CANCELLED'],
  ACCEPTED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY', 'CANCELLED'],
  READY: ['SERVED', 'CANCELLED'],
  SERVED: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

export async function updateOrderStatus(id: string, status: OrderStatus, cancelReason?: string) {
  const order: any = await prisma.order.findUnique({ where: { id }, include: ORDER_INCLUDE });
  if (!order) throw notFound('Order not found');
  if (order.status === status) return order;
  const transitions = TRANSITIONS[order.status as keyof typeof TRANSITIONS] ?? [];
  if (!transitions.includes(status)) {
    throw badRequest(`Cannot move order from ${order.status} to ${status}`);
  }

  const itemStatus: OrderItemStatus | undefined =
    status === 'PREPARING' ? 'PREPARING' : status === 'READY' ? 'READY' : status === 'SERVED' ? 'SERVED' : undefined;

  const updated = await prisma.$transaction(async (tx: any) => {
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
        emitToRoom('admin', 'table:statusChanged', { tableId: order.tableId, status: 'FREE' });
      }
    }
    return next;
  });

  emitToRoom('admin', 'order:statusChanged', { orderId: id, status });
  emitToRoom('chef', 'order:statusChanged', { orderId: id, status });
  emitToRoom(`table:${order.tableId}`, 'order:statusChanged', { orderId: id, status });

  return updated;
}

export async function updateOrderItemStatus(orderId: string, itemId: string, status: OrderItemStatus) {
  const item = await prisma.orderItem.findFirst({ where: { id: itemId, orderId } });
  if (!item) throw notFound('Order item not found');
  const updated = await prisma.orderItem.update({ where: { id: itemId }, data: { itemStatus: status } });
  emitToRoom('chef', 'order:itemStatusChanged', { orderId, itemId, status });
  emitToRoom('admin', 'order:itemStatusChanged', { orderId, itemId, status });
  return updated;
}

export async function requestWaiter(qrToken: string, type: 'waiter' | 'bill') {
  const table = await prisma.table.findUnique({ where: { qrToken } });
  if (!table) throw notFound('Invalid table QR code');
  emitToRoom('admin', type === 'waiter' ? 'waiter:called' : 'bill:requested', {
    tableId: table.id,
    tableNumber: table.number,
    at: new Date().toISOString(),
  });
  return { tableId: table.id, type };
}

export async function todayStats() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const [orders, revenueAgg, activeTables, topItems] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: start } } }),
    prisma.order.aggregate({
      where: { createdAt: { gte: start }, status: { not: 'CANCELLED' } },
      _sum: { totalAmount: true },
    }),
    prisma.table.count({ where: { status: 'OCCUPIED' } }),
    prisma.orderItem.groupBy({
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
    topItems: topItems.map((t: any) => ({ name: t.name, quantity: t._sum.quantity ?? 0 })),
  };
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}