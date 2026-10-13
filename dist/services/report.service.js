"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.salesReport = salesReport;
exports.toCsv = toCsv;
const prisma_1 = require("../config/prisma");
async function salesReport(from, to) {
    const orders = await prisma_1.prisma.order.findMany({
        where: { createdAt: { gte: from, lte: to }, status: { not: 'CANCELLED' } },
        include: { items: true, table: { select: { number: true } } },
        orderBy: { createdAt: 'asc' },
    });
    const byDay = new Map();
    for (const o of orders) {
        const key = o.createdAt.toISOString().slice(0, 10);
        const row = byDay.get(key) ?? { date: key, orders: 0, revenue: 0 };
        row.orders += 1;
        row.revenue += Number(o.totalAmount);
        byDay.set(key, row);
    }
    const itemTotals = new Map();
    for (const o of orders) {
        for (const it of o.items) {
            const row = itemTotals.get(it.name) ?? { name: it.name, quantity: 0, revenue: 0 };
            row.quantity += it.quantity;
            row.revenue += Number(it.unitPrice) * it.quantity;
            itemTotals.set(it.name, row);
        }
    }
    return {
        totals: {
            orders: orders.length,
            revenue: orders.reduce((s, o) => s + Number(o.totalAmount), 0),
            averageOrder: orders.length ? orders.reduce((s, o) => s + Number(o.totalAmount), 0) / orders.length : 0,
        },
        daily: [...byDay.values()],
        items: [...itemTotals.values()].sort((a, b) => b.quantity - a.quantity),
        orders,
    };
}
function toCsv(rows) {
    if (!rows.length)
        return '';
    const headers = Object.keys(rows[0]);
    const escape = (v) => {
        const s = v === null || v === undefined ? '' : String(v);
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    return [headers.join(','), ...rows.map((r) => headers.map((h) => escape(r[h])).join(','))].join('\n');
}
