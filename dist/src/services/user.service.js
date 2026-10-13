"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUsers = listUsers;
const prisma_1 = require("../config/prisma");
function listUsers() {
    return prisma_1.prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, active: true, createdAt: true }, orderBy: { name: "asc" } });
}
