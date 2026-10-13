"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listOrders = listOrders;
const prisma_1 = require("../config/prisma");
function listOrders() {
    return prisma_1.prisma.order.findMany({ include: { items: { include: { menuItem: true } }, table: true }, orderBy: { createdAt: "desc" }, take: 100 });
}
