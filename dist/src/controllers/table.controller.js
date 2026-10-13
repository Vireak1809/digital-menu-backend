"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTablesController = listTablesController;
const table_service_1 = require("../services/table.service");
const response_1 = require("../utils/response");
async function listTablesController(_req, res) { return (0, response_1.sendSuccess)(res, await (0, table_service_1.listTables)()); }
