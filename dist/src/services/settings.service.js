"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSettings = getSettings;
const prisma_1 = require("../config/prisma");
function getSettings() { return prisma_1.prisma.restaurantSettings.findUnique({ where: { id: "default" } }); }
