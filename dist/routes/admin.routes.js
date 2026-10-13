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
const express_1 = require("express");
const zod_1 = require("zod");
const menu = __importStar(require("../controllers/menuItem.controller"));
const tables = __importStar(require("../controllers/table.controller"));
const users = __importStar(require("../controllers/user.controller"));
const settings = __importStar(require("../controllers/settings.controller"));
const reports = __importStar(require("../controllers/report.controller"));
const async_1 = require("../utils/async");
const validate_1 = require("../middleware/validate");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const response_1 = require("../utils/response");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth, (0, auth_1.requireRole)('ADMIN', 'STAFF'));
/* ---------- Uploads ---------- */
router.post('/uploads', upload_1.upload.single('file'), (req, res) => {
    if (!req.file)
        return (0, response_1.ok)(res, null, 'No file uploaded');
    return (0, response_1.ok)(res, { url: `/uploads/${req.file.filename}` }, 'Uploaded', 201);
});
/* ---------- Categories ---------- */
const categoryBody = zod_1.z.object({
    name: zod_1.z.string().min(1).max(60),
    image: zod_1.z.string().max(500).optional().nullable(),
    sortOrder: zod_1.z.number().int().optional(),
    isActive: zod_1.z.boolean().optional(),
});
router.get('/categories', (0, async_1.asyncHandler)(menu.listCategories));
router.post('/categories', (0, validate_1.validate)({ body: categoryBody }), (0, async_1.asyncHandler)(menu.createCategory));
router.patch('/categories/:id', (0, validate_1.validate)({ body: categoryBody.partial() }), (0, async_1.asyncHandler)(menu.updateCategory));
router.delete('/categories/:id', (0, async_1.asyncHandler)(menu.deleteCategory));
router.post('/categories/reorder', (0, validate_1.validate)({ body: zod_1.z.object({ ids: zod_1.z.array(zod_1.z.string().uuid()) }) }), (0, async_1.asyncHandler)(menu.reorderCategories));
/* ---------- Menu items ---------- */
const itemBody = zod_1.z.object({
    categoryId: zod_1.z.string().min(1),
    name: zod_1.z.string().min(1).max(120),
    description: zod_1.z.string().max(600).optional().nullable(),
    price: zod_1.z.coerce.number().nonnegative(),
    image: zod_1.z.string().max(500).optional().nullable(),
    isAvailable: zod_1.z.boolean().optional(),
    prepTime: zod_1.z.coerce.number().int().min(0).max(240).optional(),
    tags: zod_1.z.array(zod_1.z.string().max(24)).max(12).optional(),
    sortOrder: zod_1.z.number().int().optional(),
});
router.get('/menu-items', (0, async_1.asyncHandler)(menu.listItems));
router.post('/menu-items', (0, validate_1.validate)({ body: itemBody }), (0, async_1.asyncHandler)(menu.createItem));
router.patch('/menu-items/:id', (0, validate_1.validate)({ body: itemBody.partial() }), (0, async_1.asyncHandler)(menu.updateItem));
router.delete('/menu-items/:id', (0, async_1.asyncHandler)(menu.deleteItem));
router.post('/menu-items/reorder', (0, validate_1.validate)({ body: zod_1.z.object({ ids: zod_1.z.array(zod_1.z.string().uuid()) }) }), (0, async_1.asyncHandler)(menu.reorderItems));
/* ---------- Tables ---------- */
const tableBody = zod_1.z.object({
    number: zod_1.z.coerce.number().int().positive(),
    name: zod_1.z.string().max(60).optional().nullable(),
    capacity: zod_1.z.coerce.number().int().min(1).max(50).optional(),
    status: zod_1.z.enum(['FREE', 'OCCUPIED', 'RESERVED']).optional(),
});
router.get('/tables', (0, async_1.asyncHandler)(tables.list));
router.post('/tables', (0, validate_1.validate)({ body: tableBody }), (0, async_1.asyncHandler)(tables.create));
router.patch('/tables/:id', (0, validate_1.validate)({ body: tableBody.partial() }), (0, async_1.asyncHandler)(tables.update));
router.delete('/tables/:id', (0, async_1.asyncHandler)(tables.remove));
router.patch('/tables/:id/status', (0, validate_1.validate)({ body: zod_1.z.object({ status: zod_1.z.enum(['FREE', 'OCCUPIED', 'RESERVED']) }) }), (0, async_1.asyncHandler)(tables.setStatus));
router.post('/tables/:id/regenerate-token', (0, async_1.asyncHandler)(tables.regenerate));
router.get('/tables/:qrToken/qr.png', (0, async_1.asyncHandler)(tables.qrPng));
router.get('/tables-print', (0, async_1.asyncHandler)(tables.printSheet));
/* ---------- Settings (read for STAFF, write for ADMIN) ---------- */
router.get('/settings', (0, async_1.asyncHandler)(settings.get));
router.patch('/settings', (0, auth_1.requireRole)('ADMIN'), (0, validate_1.validate)({
    body: zod_1.z.object({
        restaurantName: zod_1.z.string().min(1).max(80).optional(),
        logo: zod_1.z.string().max(500).optional().nullable(),
        currency: zod_1.z.string().length(3).optional(),
        taxPercent: zod_1.z.coerce.number().min(0).max(50).optional(),
        serviceChargePercent: zod_1.z.coerce.number().min(0).max(50).optional(),
        receiptFooter: zod_1.z.string().max(200).optional(),
    }),
}), (0, async_1.asyncHandler)(settings.update));
/* ---------- Reports ---------- */
router.get('/reports/summary', (0, async_1.asyncHandler)(reports.summary));
router.get('/reports/export.csv', (0, async_1.asyncHandler)(reports.exportCsv));
/* ---------- Staff management (ADMIN only) ---------- */
router.get('/users', (0, auth_1.requireRole)('ADMIN'), (0, async_1.asyncHandler)(users.list));
router.post('/users', (0, auth_1.requireRole)('ADMIN'), (0, validate_1.validate)({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1).max(80),
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(8).max(72),
        role: zod_1.z.enum(['ADMIN', 'STAFF', 'CHEF']),
    }),
}), (0, async_1.asyncHandler)(users.create));
router.patch('/users/:id', (0, auth_1.requireRole)('ADMIN'), (0, validate_1.validate)({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1).max(80).optional(),
        role: zod_1.z.enum(['ADMIN', 'STAFF', 'CHEF']).optional(),
        isActive: zod_1.z.boolean().optional(),
        password: zod_1.z.string().min(8).max(72).optional(),
    }),
}), (0, async_1.asyncHandler)(users.update));
router.delete('/users/:id', (0, auth_1.requireRole)('ADMIN'), (0, async_1.asyncHandler)(users.remove));
exports.default = router;
