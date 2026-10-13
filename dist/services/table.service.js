"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTables = listTables;
exports.getTableByToken = getTableByToken;
exports.createTable = createTable;
exports.updateTable = updateTable;
exports.deleteTable = deleteTable;
exports.setTableStatus = setTableStatus;
exports.regenerateQrToken = regenerateQrToken;
const prisma_1 = require("../config/prisma");
const errors_1 = require("../utils/errors");
async function listTables() {
    return prisma_1.prisma.table.findMany({
        orderBy: { number: 'asc' },
        include: {
            orders: {
                where: { status: { in: ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED'] } },
                select: { id: true, orderNumber: true, status: true, totalAmount: true },
            },
        },
    });
}
async function getTableByToken(qrToken) {
    const table = await prisma_1.prisma.table.findUnique({ where: { qrToken } });
    if (!table)
        throw (0, errors_1.notFound)('Invalid table QR code');
    return table;
}
async function createTable(data) {
    const existing = await prisma_1.prisma.table.findUnique({ where: { number: data.number } });
    if (existing)
        throw (0, errors_1.conflict)(`Table #${data.number} already exists`);
    return prisma_1.prisma.table.create({ data });
}
async function updateTable(id, data) {
    return prisma_1.prisma.table.update({ where: { id }, data });
}
async function deleteTable(id) {
    return prisma_1.prisma.table.delete({ where: { id } });
}
async function setTableStatus(id, status) {
    return prisma_1.prisma.table.update({ where: { id }, data: { status } });
}
async function regenerateQrToken(id) {
    return prisma_1.prisma.table.update({ where: { id }, data: { qrToken: crypto.randomUUID() } });
}
