"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.requireRole = requireRole;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const errors_1 = require("../utils/errors");
function requireAuth(req, _res, next) {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
    if (!token)
        return next(new errors_1.AppError("Authentication required", 401));
    try {
        req.user = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        next();
    }
    catch {
        next(new errors_1.AppError("Invalid or expired token", 401));
    }
}
function requireRole(...roles) {
    return (req, _res, next) => {
        if (!req.user || !roles.includes(req.user.role))
            return next(new errors_1.AppError("You do not have permission to access this resource", 403));
        next();
    };
}
