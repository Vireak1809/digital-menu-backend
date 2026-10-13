"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listMenuItemsController = listMenuItemsController;
const prisma_1 = require("../config/prisma");
const response_1 = require("../utils/response");
async function listMenuItemsController(_req, res) {
    return (0, response_1.sendSuccess)(res, await prisma_1.prisma.menuItem.findMany({ include: { category: true }, orderBy: { name: "asc" } }));
}
