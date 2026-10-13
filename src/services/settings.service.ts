import { prisma } from '../config/prisma';

export async function getSettings() {
  return prisma.settings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: { id: 'singleton' },
  });
}

export async function updateSettings(data: Record<string, unknown>) {
  await getSettings();
  return prisma.settings.update({ where: { id: 'singleton' }, data });
}