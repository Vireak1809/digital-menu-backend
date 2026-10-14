"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInitialAdminSetupStatus = getInitialAdminSetupStatus;
exports.createInitialAdmin = createInitialAdmin;
exports.login = login;
exports.refresh = refresh;
exports.logout = logout;
const node_crypto_1 = require("node:crypto");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../config/prisma");
const env_1 = require("../config/env");
const errors_1 = require("../utils/errors");
const auth_1 = require("../middleware/auth");
async function getInitialAdminSetupStatus() {
    if (!env_1.env.FIRST_ADMIN_SETUP_KEY)
        return { available: false };
    return { available: (await prisma_1.prisma.user.count()) === 0 };
}
async function createInitialAdmin(input) {
    const configuredKey = env_1.env.FIRST_ADMIN_SETUP_KEY;
    if (!configuredKey)
        throw (0, errors_1.forbidden)('First admin setup is not enabled');
    const suppliedHash = (0, node_crypto_1.createHash)('sha256').update(input.setupKey).digest();
    const configuredHash = (0, node_crypto_1.createHash)('sha256').update(configuredKey).digest();
    if (!(0, node_crypto_1.timingSafeEqual)(suppliedHash, configuredHash))
        throw (0, errors_1.unauthorized)('Invalid setup key');
    const passwordHash = await bcryptjs_1.default.hash(input.password, 10);
    try {
        return await prisma_1.prisma.$transaction(async (tx) => {
            if ((await tx.user.count()) !== 0)
                throw (0, errors_1.conflict)('Initial admin setup is already completed');
            return tx.user.create({
                data: {
                    name: input.name.trim(),
                    email: input.email.trim().toLowerCase(),
                    passwordHash,
                    role: 'ADMIN',
                    isActive: true,
                },
            });
        }, { isolationLevel: 'Serializable' });
    }
    catch (error) {
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2034') {
            throw (0, errors_1.conflict)('Initial admin setup is already completed');
        }
        throw error;
    }
}
async function login(email, password) {
    const user = await prisma_1.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user || !user.isActive)
        throw (0, errors_1.unauthorized)('Invalid credentials');
    const valid = await bcryptjs_1.default.compare(password, user.passwordHash);
    if (!valid)
        throw (0, errors_1.unauthorized)('Invalid credentials');
    const payload = {
        sub: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
    };
    const accessToken = (0, auth_1.signAccessToken)(payload);
    const refreshToken = jsonwebtoken_1.default.sign({ sub: user.id, tokenVersion: user.updatedAt.getTime().toString() }, env_1.env.JWT_REFRESH_SECRET, { expiresIn: env_1.env.REFRESH_TOKEN_TTL });
    await prisma_1.prisma.user.update({
        where: { id: user.id },
        data: { refreshTokenHash: await bcryptjs_1.default.hash(refreshToken, 10) },
    });
    return { accessToken, refreshToken, user: publicUser(user) };
}
async function refresh(token) {
    if (!token)
        throw (0, errors_1.unauthorized)('Missing refresh token');
    let payload;
    try {
        payload = jsonwebtoken_1.default.verify(token, env_1.env.JWT_REFRESH_SECRET);
    }
    catch {
        throw (0, errors_1.unauthorized)('Invalid refresh token');
    }
    const user = await prisma_1.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.isActive || !user.refreshTokenHash)
        throw (0, errors_1.unauthorized)('Session expired');
    if (user.updatedAt.getTime().toString() !== payload.tokenVersion)
        throw (0, errors_1.unauthorized)('Session expired');
    const valid = await bcryptjs_1.default.compare(token, user.refreshTokenHash);
    if (!valid)
        throw (0, errors_1.unauthorized)('Session expired');
    return login(user.email, '').catch(() => null) ?? rotate(user.id);
}
async function rotate(userId) {
    const user = await prisma_1.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const payload = { sub: user.id, role: user.role, name: user.name, email: user.email };
    const accessToken = (0, auth_1.signAccessToken)(payload);
    const refreshToken = jsonwebtoken_1.default.sign({ sub: user.id, tokenVersion: user.updatedAt.getTime().toString() }, env_1.env.JWT_REFRESH_SECRET, { expiresIn: env_1.env.REFRESH_TOKEN_TTL });
    await prisma_1.prisma.user.update({
        where: { id: user.id },
        data: { refreshTokenHash: await bcryptjs_1.default.hash(refreshToken, 10) },
    });
    return { accessToken, refreshToken, user: publicUser(user) };
}
async function logout(userId) {
    await prisma_1.prisma.user.update({ where: { id: userId }, data: { refreshTokenHash: null } }).catch(() => null);
}
function publicUser(u) {
    return { id: u.id, name: u.name, email: u.email, role: u.role, isActive: u.isActive };
}
