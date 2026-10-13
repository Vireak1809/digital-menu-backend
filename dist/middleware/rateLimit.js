"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authLimiter = exports.publicOrderLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
exports.publicOrderLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60_000,
    limit: 20,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { success: false, data: null, message: 'Too many requests, slow down.', errors: null },
});
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60_000,
    limit: 30,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { success: false, data: null, message: 'Too many login attempts.', errors: null },
});
