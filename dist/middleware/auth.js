"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = void 0;
exports.signAccessToken = signAccessToken;
exports.requireAuth = requireAuth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const errors_1 = require("../utils/errors");
function signAccessToken(payload) {
    return jsonwebtoken_1.default.sign(payload, env_1.env.JWT_ACCESS_SECRET, { expiresIn: env_1.env.ACCESS_TOKEN_TTL });
}
function requireAuth(req, _res, next) {
    const header = req.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
    if (!token)
        return next((0, errors_1.unauthorized)('Missing access token'));
    try {
        req.user = jsonwebtoken_1.default.verify(token, env_1.env.JWT_ACCESS_SECRET);
        next();
    }
    catch {
        next((0, errors_1.unauthorized)('Invalid or expired access token'));
    }
}
const requireRole = (...roles) => (req, _res, next) => {
    if (!req.user)
        return next((0, errors_1.unauthorized)());
    if (!roles.includes(req.user.role))
        return next((0, errors_1.forbidden)('Insufficient permissions'));
    next();
};
exports.requireRole = requireRole;
