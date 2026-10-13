"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRateLimit = void 0;
const express_rate_limit_1 = require("express-rate-limit");
exports.apiRateLimit = (0, express_rate_limit_1.rateLimit)({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: "draft-8", legacyHeaders: false });
