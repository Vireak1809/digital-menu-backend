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
const ctrl = __importStar(require("../controllers/public.controller"));
const async_1 = require("../utils/async");
const validate_1 = require("../middleware/validate");
const rateLimit_1 = require("../middleware/rateLimit");
const tables = __importStar(require("../controllers/table.controller"));
const router = (0, express_1.Router)();
const qrTokenParam = zod_1.z.object({ qrToken: zod_1.z.string().uuid() });
router.get('/tables/:qrToken/qr.png', (0, validate_1.validate)({ params: qrTokenParam }), (0, async_1.asyncHandler)(tables.qrPng));
router.get('/menu/:qrToken', (0, validate_1.validate)({ params: qrTokenParam }), (0, async_1.asyncHandler)(ctrl.getMenu));
router.get('/tables/:qrToken/orders', (0, validate_1.validate)({ params: qrTokenParam }), (0, async_1.asyncHandler)(ctrl.getTableSession));
router.post('/tables/:qrToken/orders', rateLimit_1.publicOrderLimiter, (0, validate_1.validate)({
    params: qrTokenParam,
    body: zod_1.z.object({
        customerName: zod_1.z.string().max(80).optional(),
        customerPhone: zod_1.z.string().max(30).optional(),
        note: zod_1.z.string().max(300).optional(),
        items: zod_1.z
            .array(zod_1.z.object({
            menuItemId: zod_1.z.string().min(1),
            quantity: zod_1.z.number().int().min(1).max(50),
            note: zod_1.z.string().max(200).optional(),
        }))
            .min(1)
            .max(50),
    }),
}), (0, async_1.asyncHandler)(ctrl.createOrder));
router.get('/orders/:orderId', (0, validate_1.validate)({ params: zod_1.z.object({ orderId: zod_1.z.string().uuid() }) }), (0, async_1.asyncHandler)(ctrl.getOrder));
router.post('/tables/:qrToken/call-waiter', rateLimit_1.publicOrderLimiter, (0, validate_1.validate)({ params: qrTokenParam }), (0, async_1.asyncHandler)(ctrl.callWaiter));
router.post('/tables/:qrToken/request-bill', rateLimit_1.publicOrderLimiter, (0, validate_1.validate)({ params: qrTokenParam }), (0, async_1.asyncHandler)(ctrl.requestBill));
exports.default = router;
