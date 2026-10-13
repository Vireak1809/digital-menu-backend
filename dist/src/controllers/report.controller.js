"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportController = reportController;
const report_service_1 = require("../services/report.service");
const response_1 = require("../utils/response");
async function reportController(_req, res) { return (0, response_1.sendSuccess)(res, await (0, report_service_1.getReportSummary)()); }
