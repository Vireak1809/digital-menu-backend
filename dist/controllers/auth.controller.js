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
exports.login = login;
exports.initialAdminSetupStatus = initialAdminSetupStatus;
exports.createInitialAdmin = createInitialAdmin;
exports.refresh = refresh;
exports.logout = logout;
exports.me = me;
const authService = __importStar(require("../services/auth.service"));
const response_1 = require("../utils/response");
const env_1 = require("../config/env");
const errors_1 = require("../utils/errors");
const REFRESH_COOKIE = 'refresh_token';
const cookieOptions = {
    httpOnly: true,
    secure: env_1.env.isProd,
    sameSite: 'lax',
    path: '/api/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000,
};
async function login(req, res) {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.cookie(REFRESH_COOKIE, result.refreshToken, cookieOptions);
    return (0, response_1.ok)(res, { accessToken: result.accessToken, user: result.user }, 'Logged in');
}
async function initialAdminSetupStatus(_req, res) {
    return (0, response_1.ok)(res, await authService.getInitialAdminSetupStatus());
}
async function createInitialAdmin(req, res) {
    await authService.createInitialAdmin(req.body);
    return (0, response_1.ok)(res, null, 'Initial admin created');
}
async function refresh(req, res) {
    const result = await authService.refresh(req.cookies?.[REFRESH_COOKIE]);
    if (!result)
        throw (0, errors_1.unauthorized)('Session expired');
    res.cookie(REFRESH_COOKIE, result.refreshToken, cookieOptions);
    return (0, response_1.ok)(res, { accessToken: result.accessToken, user: result.user }, 'Token refreshed');
}
async function logout(req, res) {
    if (req.user)
        await authService.logout(req.user.sub);
    res.clearCookie(REFRESH_COOKIE, { ...cookieOptions, maxAge: undefined });
    return (0, response_1.ok)(res, null, 'Logged out');
}
async function me(req, res) {
    if (!req.user)
        throw (0, errors_1.unauthorized)();
    return (0, response_1.ok)(res, req.user);
}
