"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUsersController = listUsersController;
const user_service_1 = require("../services/user.service");
const response_1 = require("../utils/response");
async function listUsersController(_req, res) { return (0, response_1.sendSuccess)(res, await (0, user_service_1.listUsers)()); }
