import { Router } from 'express';
import { z } from 'zod';
import multer from 'multer';
import * as menu from '../controllers/menuItem.controller';
import * as tables from '../controllers/table.controller';
import * as users from '../controllers/user.controller';
import * as settings from '../controllers/settings.controller';
import * as reports from '../controllers/report.controller';
import { asyncHandler } from '../utils/async';
import { validate } from '../middleware/validate';
import { requireAuth, requireRole } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { ok } from '../utils/response';

const router = Router();
router.use(requireAuth, requireRole('ADMIN', 'STAFF'));

/* ---------- Uploads ---------- */
router.post('/uploads', upload.single('file'), (req, res) => {
  if (!req.file) return ok(res, null, 'No file uploaded');
  return ok(res, { url: `/uploads/${req.file.filename}` }, 'Uploaded', 201);
});

/* ---------- Categories ---------- */
const categoryBody = z.object({
  name: z.string().min(1).max(60),
  image: z.string().max(500).optional().nullable(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

router.get('/categories', asyncHandler(menu.listCategories));
router.post('/categories', validate({ body: categoryBody }), asyncHandler(menu.createCategory));
router.patch('/categories/:id', validate({ body: categoryBody.partial() }), asyncHandler(menu.updateCategory));
router.delete('/categories/:id', asyncHandler(menu.deleteCategory));
router.post('/categories/reorder', validate({ body: z.object({ ids: z.array(z.string().uuid()) }) }), asyncHandler(menu.reorderCategories));

/* ---------- Menu items ---------- */
const itemBody = z.object({
  categoryId: z.string().min(1),
  name: z.string().min(1).max(120),
  description: z.string().max(600).optional().nullable(),
  price: z.coerce.number().nonnegative(),
  image: z.string().max(500).optional().nullable(),
  isAvailable: z.boolean().optional(),
  prepTime: z.coerce.number().int().min(0).max(240).optional(),
  tags: z.array(z.string().max(24)).max(12).optional(),
  sortOrder: z.number().int().optional(),
});

router.get('/menu-items', asyncHandler(menu.listItems));
router.post('/menu-items', validate({ body: itemBody }), asyncHandler(menu.createItem));
router.patch('/menu-items/:id', validate({ body: itemBody.partial() }), asyncHandler(menu.updateItem));
router.delete('/menu-items/:id', asyncHandler(menu.deleteItem));
router.post('/menu-items/reorder', validate({ body: z.object({ ids: z.array(z.string().uuid()) }) }), asyncHandler(menu.reorderItems));

/* ---------- Tables ---------- */
const tableBody = z.object({
  number: z.coerce.number().int().positive(),
  name: z.string().max(60).optional().nullable(),
  capacity: z.coerce.number().int().min(1).max(50).optional(),
  status: z.enum(['FREE', 'OCCUPIED', 'RESERVED']).optional(),
});

router.get('/tables', asyncHandler(tables.list));
router.post('/tables', validate({ body: tableBody }), asyncHandler(tables.create));
router.patch('/tables/:id', validate({ body: tableBody.partial() }), asyncHandler(tables.update));
router.delete('/tables/:id', asyncHandler(tables.remove));
router.patch('/tables/:id/status', validate({ body: z.object({ status: z.enum(['FREE', 'OCCUPIED', 'RESERVED']) }) }), asyncHandler(tables.setStatus));
router.post('/tables/:id/regenerate-token', asyncHandler(tables.regenerate));
router.get('/tables/:qrToken/qr.png', asyncHandler(tables.qrPng));
router.get('/tables-print', asyncHandler(tables.printSheet));

/* ---------- Settings (read for STAFF, write for ADMIN) ---------- */
router.get('/settings', asyncHandler(settings.get));
router.patch('/settings', requireRole('ADMIN'), validate({
  body: z.object({
    restaurantName: z.string().min(1).max(80).optional(),
    logo: z.string().max(500).optional().nullable(),
    currency: z.string().length(3).optional(),
    taxPercent: z.coerce.number().min(0).max(50).optional(),
    serviceChargePercent: z.coerce.number().min(0).max(50).optional(),
    receiptFooter: z.string().max(200).optional(),
  }),
}), asyncHandler(settings.update));

/* ---------- Reports ---------- */
router.get('/reports/summary', asyncHandler(reports.summary));
router.get('/reports/export.csv', asyncHandler(reports.exportCsv));

/* ---------- Staff management (ADMIN only) ---------- */
router.get('/users', requireRole('ADMIN'), asyncHandler(users.list));
router.post('/users', requireRole('ADMIN'), validate({
  body: z.object({
    name: z.string().min(1).max(80),
    email: z.string().email(),
    password: z.string().min(8).max(72),
    role: z.enum(['ADMIN', 'STAFF', 'CHEF']),
  }),
}), asyncHandler(users.create));
router.patch('/users/:id', requireRole('ADMIN'), validate({
  body: z.object({
    name: z.string().min(1).max(80).optional(),
    role: z.enum(['ADMIN', 'STAFF', 'CHEF']).optional(),
    isActive: z.boolean().optional(),
    password: z.string().min(8).max(72).optional(),
  }),
}), asyncHandler(users.update));
router.delete('/users/:id', requireRole('ADMIN'), asyncHandler(users.remove));

export default router;