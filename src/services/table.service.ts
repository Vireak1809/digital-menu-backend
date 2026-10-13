import { prisma } from '../config/prisma';
import { conflict, notFound } from '../utils/errors';

export async function listTables() {
  return prisma.table.findMany({
    orderBy: { number: 'asc' },
    include: {
      orders: {
        where: { status: { in: ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED'] } },
        select: { id: true, orderNumber: true, status: true, totalAmount: true },
      },
    },
  });
}

export async function getTableByToken(qrToken: string) {
  const table = await prisma.table.findUnique({ where: { qrToken } });
  if (!table) throw notFound('Invalid table QR code');
  return table;
}

export async function createTable(data: { number: number; name?: string; capacity?: number }) {
  const existing = await prisma.table.findUnique({ where: { number: data.number } });
  if (existing) throw conflict(`Table #${data.number} already exists`);
  return prisma.table.create({ data });
}

export async function updateTable(id: string, data: Record<string, unknown>) {
  return prisma.table.update({ where: { id }, data });
}

export async function deleteTable(id: string) {
  return prisma.table.delete({ where: { id } });
}

export async function setTableStatus(id: string, status: 'FREE' | 'OCCUPIED' | 'RESERVED') {
  return prisma.table.update({ where: { id }, data: { status } });
}

export async function regenerateQrToken(id: string) {
  return prisma.table.update({ where: { id }, data: { qrToken: crypto.randomUUID() } });
}