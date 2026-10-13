"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const prisma_1 = require("../config/prisma");
const errors_1 = require("../utils/errors");
async function login(email, password) {
    const user = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (!user || !user.active || !(await bcryptjs_1.default.compare(password, user.passwordHash)))
        throw new errors_1.AppError("Invalid email or password", 401);
    const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, env_1.env.JWT_SECRET, {
        expiresIn: env_1.env.JWT_EXPIRES_IN,
    });
    return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
}
