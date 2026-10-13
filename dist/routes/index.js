"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const public_routes_1 = __importDefault(require("./public.routes"));
const admin_routes_1 = __importDefault(require("./admin.routes"));
const order_routes_1 = __importDefault(require("./order.routes"));
const chef_routes_1 = __importDefault(require("./chef.routes"));
const router = (0, express_1.Router)();
router.get('/health', (_req, res) => res.json({ success: true, data: { status: 'ok' }, message: 'OK', errors: null }));
router.use('/auth', auth_routes_1.default);
router.use('/public', public_routes_1.default);
router.use('/admin', admin_routes_1.default);
router.use('/orders', order_routes_1.default);
router.use('/chef', chef_routes_1.default);
exports.default = router;
