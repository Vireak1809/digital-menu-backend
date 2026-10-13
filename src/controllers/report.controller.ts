import type { Request, Response } from 'express';
import * as reportService from '../services/report.service';
import { ok } from '../utils/response';

function range(query: Record<string, string | undefined>) {
  const to = query.to ? new Date(query.to) : new Date();
  const from = query.from ? new Date(query.from) : new Date(to.getTime() - 6 * 24 * 3600 * 1000);
  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);
  return { from, to };
}

export async function summary(req: Request, res: Response) {
  const { from, to } = range(req.query as never);
  return ok(res, await reportService.salesReport(from, to));
}

export async function exportCsv(req: Request, res: Response) {
  const { from, to } = range(req.query as never);
  const report = await reportService.salesReport(from, to);
  const rows = report.orders.map((o: any) => ({
    orderNumber: o.orderNumber,
    date: o.createdAt.toISOString(),
    table: o.table.number,
    status: o.status,
    items: o.items.map((i: any) => `${i.quantity}x ${i.name}`).join(' | '),
    subtotal: Number(o.subtotal).toFixed(2),
    tax: Number(o.taxAmount).toFixed(2),
    service: Number(o.serviceAmount).toFixed(2),
    total: Number(o.totalAmount).toFixed(2),
  }));
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="sales-${from.toISOString().slice(0, 10)}.csv"`);
  return res.send(reportService.toCsv(rows));
}