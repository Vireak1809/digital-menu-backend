"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.summary = summary;
exports.exportCsv = exportCsv;
const reportService = __importStar(require("../services/report.service"));
const response_1 = require("../utils/response");
function range(query) {
    const to = query.to ? new Date(query.to) : new Date();
    const from = query.from ? new Date(query.from) : new Date(to.getTime() - 6 * 24 * 3600 * 1000);
    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);
    return { from, to };
}
async function summary(req, res) {
    const { from, to } = range(req.query);
    return (0, response_1.ok)(res, await reportService.salesReport(from, to));
}
async function exportCsv(req, res) {
    const { from, to } = range(req.query);
    const report = await reportService.salesReport(from, to);
    const rows = report.orders.map((o) => ({
        orderNumber: o.orderNumber,
        date: o.createdAt.toISOString(),
        table: o.table.number,
        status: o.status,
        items: o.items.map((i) => `${i.quantity}x ${i.name}`).join(' | '),
        subtotal: Number(o.subtotal).toFixed(2),
        tax: Number(o.taxAmount).toFixed(2),
        service: Number(o.serviceAmount).toFixed(2),
        total: Number(o.totalAmount).toFixed(2),
    }));
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="sales-${from.toISOString().slice(0, 10)}.csv"`);
    return res.send(reportService.toCsv(rows));
}
