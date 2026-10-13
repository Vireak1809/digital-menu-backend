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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.regenerate = exports.setStatus = exports.remove = exports.update = exports.create = exports.list = void 0;
exports.qrPng = qrPng;
exports.printSheet = printSheet;
const qrcode_1 = __importDefault(require("qrcode"));
const tableService = __importStar(require("../services/table.service"));
const param_1 = require("../utils/param");
const response_1 = require("../utils/response");
const env_1 = require("../config/env");
const list = async (_req, res) => (0, response_1.ok)(res, await tableService.listTables());
exports.list = list;
const create = async (req, res) => (0, response_1.ok)(res, await tableService.createTable(req.body), 'Table created', 201);
exports.create = create;
const update = async (req, res) => (0, response_1.ok)(res, await tableService.updateTable((0, param_1.readParam)(req, 'id'), req.body), 'Table updated');
exports.update = update;
const remove = async (req, res) => {
    await tableService.deleteTable((0, param_1.readParam)(req, 'id'));
    return (0, response_1.ok)(res, null, 'Table deleted');
};
exports.remove = remove;
const setStatus = async (req, res) => (0, response_1.ok)(res, await tableService.setTableStatus((0, param_1.readParam)(req, 'id'), req.body.status), 'Status updated');
exports.setStatus = setStatus;
const regenerate = async (req, res) => (0, response_1.ok)(res, await tableService.regenerateQrToken((0, param_1.readParam)(req, 'id')), 'QR token regenerated');
exports.regenerate = regenerate;
/** Streams a PNG QR code that deep-links into the customer menu. */
async function qrPng(req, res) {
    const qrToken = (0, param_1.readParam)(req, 'qrToken');
    const table = await tableService.getTableByToken(qrToken);
    const url = `${env_1.env.PUBLIC_BASE_URL}/menu/${table.qrToken}`;
    const buffer = await qrcode_1.default.toBuffer(url, {
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
async function printSheet(_req, res) {
    const tables = await tableService.listTables();
    const cards = await Promise.all(tables.map(async (t) => {
        const url = `${env_1.env.PUBLIC_BASE_URL}/menu/${t.qrToken}`;
        const dataUrl = await qrcode_1.default.toDataURL(url, { width: 320, margin: 1 });
        return `<div class="card"><img src="${dataUrl}" /><h2>Table ${t.number}</h2><p>${url}</p></div>`;
    }));
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
