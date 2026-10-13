"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCategoriesController = listCategoriesController;
const menu_service_1 = require("../services/menu.service");
const response_1 = require("../utils/response");
async function listCategoriesController(_req, res) { return (0, response_1.sendSuccess)(res, await (0, menu_service_1.getPublicMenu)()); }
