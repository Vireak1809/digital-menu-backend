"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicMenu = getPublicMenu;
const prisma_1 = require("../config/prisma");
function getPublicMenu() {
    return prisma_1.prisma.category.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" }, include: { items: { where: { available: true }, orderBy: { name: "asc" } } } });
}
