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
const orders = __importStar(require("../controllers/order.controller"));
const async_1 = require("../utils/async");
const validate_1 = require("../middleware/validate");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth, (0, auth_1.requireRole)('ADMIN', 'STAFF', 'CHEF'));
const statusEnum = zod_1.z.enum(['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED', 'CANCELLED']);
const itemStatusEnum = zod_1.z.enum(['PENDING', 'PREPARING', 'READY', 'SERVED', 'CANCELLED']);
router.get('/', (0, validate_1.validate)({
    query: zod_1.z.object({
        status: statusEnum.optional(),
        tableId: zod_1.z.string().uuid().optional(),
        from: zod_1.z.string().optional(),
        to: zod_1.z.string().optional(),
        active: zod_1.z.enum(['true', 'false']).optional(),
        limit: zod_1.z.coerce.number().int().min(1).max(500).optional(),
    }).partial(),
}), (0, async_1.asyncHandler)(orders.list));
router.get('/stats/today', (0, async_1.asyncHandler)(orders.stats));
router.get('/:id', (0, async_1.asyncHandler)(orders.get));
router.patch('/:id/status', (0, validate_1.validate)({
    body: zod_1.z.object({ status: statusEnum, cancelReason: zod_1.z.string().max(200).optional() }),
}), (0, async_1.asyncHandler)(orders.updateStatus));
router.patch('/:id/items/:itemId/status', (0, validate_1.validate)({
    body: zod_1.z.object({ status: itemStatusEnum }),
}), (0, async_1.asyncHandler)(orders.updateItemStatus));
// Kitchen & floor staff can 86 an item without touching the admin panel.
router.patch('/menu-items/:id/availability', (0, validate_1.validate)({
    body: zod_1.z.object({ isAvailable: zod_1.z.boolean() }),
}), (0, async_1.asyncHandler)(orders.toggleAvailability));
exports.default = router;
