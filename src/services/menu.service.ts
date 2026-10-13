import { prisma } from '../config/prisma';
import { notFound } from '../utils/errors';

export async function getPublicMenu(qrToken: string) {
  const table = await prisma.table.findUnique({ where: { qrToken } });
  if (!table) throw notFound('Invalid table QR code');

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    include: {
      items: {
        where: { isAvailable: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
  });

  return { table, categories };
}

export async function listCategories(includeInactive = true) {
  return prisma.category.findMany({
    where: includeInactive ? {} : { isActive: true },
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { items: true } } },
  });
}

export async function createCategory(data: { name: string; image?: string; sortOrder?: number }) {
  return prisma.category.create({ data });
}

export async function updateCategory(id: string, data: Record<string, unknown>) {
  return prisma.category.update({ where: { id }, data });
}

export async function deleteCategory(id: string) {
  return prisma.category.delete({ where: { id } });
}

export async function reorderCategories(ids: string[]) {
  await prisma.$transaction(
    ids.map((id, index) => prisma.category.update({ where: { id }, data: { sortOrder: index } })),
  );
}

export async function listMenuItems(filters: { categoryId?: string; search?: string }) {
  return prisma.menuItem.findMany({
    where: {
      ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
      ...(filters.search ? { name: { contains: filters.search, mode: 'insensitive' } } : {}),
    },
    orderBy: [{ categoryId: 'asc' }, { sortOrder: 'asc' }],
    include: { category: { select: { id: true, name: true } } },
  });
}

export async function createMenuItem(data: Record<string, unknown>) {
  return prisma.menuItem.create({ data: data as never });
}

export async function updateMenuItem(id: string, data: Record<string, unknown>) {
  return prisma.menuItem.update({ where: { id }, data });
}

export async function deleteMenuItem(id: string) {
  return prisma.menuItem.delete({ where: { id } });
}

export async function setItemAvailability(id: string, isAvailable: boolean) {
  return prisma.menuItem.update({ where: { id }, data: { isAvailable } });
}

export async function reorderMenuItems(ids: string[]) {
  await prisma.$transaction(
    ids.map((id, index) => prisma.menuItem.update({ where: { id }, data: { sortOrder: index } })),
  );
}