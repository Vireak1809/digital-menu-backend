"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.menuController = menuController;
const menu_service_1 = require("../services/menu.service");
const settings_service_1 = require("../services/settings.service");
const response_1 = require("../utils/response");
async function menuController(_req, res) {
    const [settings, categories] = await Promise.all([(0, settings_service_1.getSettings)(), (0, menu_service_1.getPublicMenu)()]);
    return (0, response_1.sendSuccess)(res, { settings, categories });
}
