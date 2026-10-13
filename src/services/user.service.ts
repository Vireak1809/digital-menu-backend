import bcrypt from 'bcryptjs';
import type { Role } from '@prisma/client';
import { prisma } from '../config/prisma';
import { badRequest, notFound } from '../utils/errors';

const SELECT = { id: true, name: true, email: true, role: true, isActive: true, createdAt: true } as const;

export const listUsers = () => prisma.user.findMany({ select: SELECT, orderBy: { createdAt: 'asc' } });

export async function createUser(data: { name: string; email: string; password: string; role: Role }) {
  if (data.password.length < 8) throw badRequest('Password must be at least 8 characters');
  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email.toLowerCase(),
      role: data.role,
      passwordHash: await bcrypt.hash(data.password, 10),
    },
    select: SELECT,
  });
}

export async function updateUser(
  id: string,
  data: { name?: string; role?: Role; isActive?: boolean; password?: string },
) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw notFound('User not found');
  return prisma.user.update({
    where: { id },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.role !== undefined ? { role: data.role } : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      ...(data.password ? { passwordHash: await bcrypt.hash(data.password, 10) } : {}),
    },
    select: SELECT,
  });
}

export async function deleteUser(id: string) {
  return prisma.user.delete({ where: { id }, select: SELECT });
}