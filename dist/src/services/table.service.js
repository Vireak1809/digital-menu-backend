"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTables = listTables;
const prisma_1 = require("../config/prisma");
function listTables() { return prisma_1.prisma.diningTable.findMany({ orderBy: { name: "asc" } }); }
