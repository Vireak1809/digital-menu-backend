import type { Request, Response } from 'express';
import QRCode from 'qrcode';
import * as tableService from '../services/table.service';
import { readParam } from '../utils/param';
import { ok } from '../utils/response';
import { env } from '../config/env';

export const list = async (_req: Request, res: Response) => ok(res, await tableService.listTables());

export const create = async (req: Request, res: Response) =>
  ok(res, await tableService.createTable(req.body), 'Table created', 201);

export const update = async (req: Request, res: Response) =>
  ok(res, await tableService.updateTable(readParam(req, 'id'), req.body), 'Table updated');

export const remove = async (req: Request, res: Response) => {
  await tableService.deleteTable(readParam(req, 'id'));
  return ok(res, null, 'Table deleted');
};

export const setStatus = async (req: Request, res: Response) =>
  ok(res, await tableService.setTableStatus(readParam(req, 'id'), req.body.status), 'Status updated');

export const regenerate = async (req: Request, res: Response) =>
  ok(res, await tableService.regenerateQrToken(readParam(req, 'id')), 'QR token regenerated');

/** Streams a PNG QR code that deep-links into the customer menu. */
export async function qrPng(req: Request, res: Response) {
  const qrToken = readParam(req, 'qrToken');
  const table = await tableService.getTableByToken(qrToken);
  const url = `${env.PUBLIC_BASE_URL}/menu/${table.qrToken}`;
  const buffer = await QRCode.toBuffer(url, {
    type: 'png',
    width: (Number(req.query.size) || 512),
    margin: 2,
    errorCorrectionLevel: 'M',
  });
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Content-Disposition', `inline; filename="table-${table.number}-qr.png"`);
  return res.send(buffer);
}

/** One-page printable sheet with every table's QR code. */
export async function printSheet(_req: Request, res: Response) {
  const tables = await tableService.listTables();
  const cards = await Promise.all(
    tables.map(async (t: any) => {
      const url = `${env.PUBLIC_BASE_URL}/menu/${t.qrToken}`;
      const dataUrl = await QRCode.toDataURL(url, { width: 320, margin: 1 });
      return `<div class="card"><img src="${dataUrl}" /><h2>Table ${t.number}</h2><p>${url}</p></div>`;
    }),
  );
  res.setHeader('Content-Type', 'text/html');
  return res.send(`<!doctype html><html><head><meta charset="utf-8"><title>Table QR Codes</title>
<style>
  body{font-family:system-ui,sans-serif;margin:24px;background:#fff}
  .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
  .card{border:1px dashed #999;border-radius:12px;padding:16px;text-align:center;page-break-inside:avoid}
  .card img{width:100%;max-width:240px}
  h2{margin:8px 0 4px}
  p{font-size:10px;color:#666;word-break:break-all}
  @media print{.grid{grid-template-columns:repeat(2,1fr)}}
</style></head><body><div class="grid">${cards.join('')}</div>
<script>window.onload=()=>{if(location.search.includes('print'))window.print()}</script>
</body></html>`);
}