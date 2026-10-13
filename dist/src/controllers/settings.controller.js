"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingsController = settingsController;
const settings_service_1 = require("../services/settings.service");
const response_1 = require("../utils/response");
async function settingsController(_req, res) { return (0, response_1.sendSuccess)(res, await (0, settings_service_1.getSettings)()); }
