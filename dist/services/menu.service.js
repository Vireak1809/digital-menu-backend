"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicMenu = getPublicMenu;
exports.listCategories = listCategories;
exports.createCategory = createCategory;
exports.updateCategory = updateCategory;
exports.deleteCategory = deleteCategory;
exports.reorderCategories = reorderCategories;
exports.listMenuItems = listMenuItems;
exports.createMenuItem = createMenuItem;
exports.updateMenuItem = updateMenuItem;
exports.deleteMenuItem = deleteMenuItem;
exports.setItemAvailability = setItemAvailability;
exports.reorderMenuItems = reorderMenuItems;
const prisma_1 = require("../config/prisma");
const errors_1 = require("../utils/errors");
async function getPublicMenu(qrToken) {
    const table = await prisma_1.prisma.table.findUnique({ where: { qrToken } });
    if (!table)
        throw (0, errors_1.notFound)('Invalid table QR code');
    const categories = await prisma_1.prisma.category.findMany({
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
async function listCategories(includeInactive = true) {
    return prisma_1.prisma.category.findMany({
        where: includeInactive ? {} : { isActive: true },
        orderBy: { sortOrder: 'asc' },
        include: { _count: { select: { items: true } } },
    });
}
async function createCategory(data) {
    return prisma_1.prisma.category.create({ data });
}
async function updateCategory(id, data) {
    return prisma_1.prisma.category.update({ where: { id }, data });
}
async function deleteCategory(id) {
    return prisma_1.prisma.category.delete({ where: { id } });
}
async function reorderCategories(ids) {
    await prisma_1.prisma.$transaction(ids.map((id, index) => prisma_1.prisma.category.update({ where: { id }, data: { sortOrder: index } })));
}
async function listMenuItems(filters) {
    return prisma_1.prisma.menuItem.findMany({
        where: {
            ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
            ...(filters.search ? { name: { contains: filters.search, mode: 'insensitive' } } : {}),
        },
        orderBy: [{ categoryId: 'asc' }, { sortOrder: 'asc' }],
        include: { category: { select: { id: true, name: true } } },
    });
}
async function createMenuItem(data) {
    return prisma_1.prisma.menuItem.create({ data: data });
}
async function updateMenuItem(id, data) {
    return prisma_1.prisma.menuItem.update({ where: { id }, data });
}
async function deleteMenuItem(id) {
    return prisma_1.prisma.menuItem.delete({ where: { id } });
}
async function setItemAvailability(id, isAvailable) {
    return prisma_1.prisma.menuItem.update({ where: { id }, data: { isAvailable } });
}
async function reorderMenuItems(ids) {
    await prisma_1.prisma.$transaction(ids.map((id, index) => prisma_1.prisma.menuItem.update({ where: { id }, data: { sortOrder: index } })));
}
