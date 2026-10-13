"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSettings = getSettings;
exports.updateSettings = updateSettings;
const prisma_1 = require("../config/prisma");
async function getSettings() {
    return prisma_1.prisma.settings.upsert({
        where: { id: 'singleton' },
        update: {},
        create: { id: 'singleton' },
    });
}
async function updateSettings(data) {
    await getSettings();
    return prisma_1.prisma.settings.update({ where: { id: 'singleton' }, data });
}
