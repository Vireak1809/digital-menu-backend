"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUsers = void 0;
exports.createUser = createUser;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../config/prisma");
const errors_1 = require("../utils/errors");
const SELECT = { id: true, name: true, email: true, role: true, isActive: true, createdAt: true };
const listUsers = () => prisma_1.prisma.user.findMany({ select: SELECT, orderBy: { createdAt: 'asc' } });
exports.listUsers = listUsers;
async function createUser(data) {
    if (data.password.length < 8)
        throw (0, errors_1.badRequest)('Password must be at least 8 characters');
    return prisma_1.prisma.user.create({
        data: {
            name: data.name,
            email: data.email.toLowerCase(),
            role: data.role,
            passwordHash: await bcryptjs_1.default.hash(data.password, 10),
        },
        select: SELECT,
    });
}
async function updateUser(id, data) {
    const user = await prisma_1.prisma.user.findUnique({ where: { id } });
    if (!user)
        throw (0, errors_1.notFound)('User not found');
    return prisma_1.prisma.user.update({
        where: { id },
        data: {
            ...(data.name !== undefined ? { name: data.name } : {}),
            ...(data.role !== undefined ? { role: data.role } : {}),
            ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
            ...(data.password ? { passwordHash: await bcryptjs_1.default.hash(data.password, 10) } : {}),
        },
        select: SELECT,
    });
}
async function deleteUser(id) {
    return prisma_1.prisma.user.delete({ where: { id }, select: SELECT });
}
