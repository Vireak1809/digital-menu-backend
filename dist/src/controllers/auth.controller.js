"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginController = loginController;
exports.meController = meController;
const zod_1 = require("zod");
const auth_service_1 = require("../services/auth.service");
const response_1 = require("../utils/response");
const loginSchema = zod_1.z.object({ email: zod_1.z.string().email(), password: zod_1.z.string().min(1) });
async function loginController(req, res) {
    const credentials = loginSchema.parse(req.body);
    return (0, response_1.sendSuccess)(res, await (0, auth_service_1.login)(credentials.email, credentials.password));
}
async function meController(req, res) { return (0, response_1.sendSuccess)(res, req.user ?? null); }
