"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReportSummary = getReportSummary;
const prisma_1 = require("../config/prisma");
async function getReportSummary() {
    const [orders, menuItems, activeTables] = await Promise.all([
        prisma_1.prisma.order.count(), prisma_1.prisma.menuItem.count(), prisma_1.prisma.diningTable.count({ where: { active: true } }),
    ]);
    return { orders, menuItems, activeTables };
}
