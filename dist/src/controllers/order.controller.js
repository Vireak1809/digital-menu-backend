"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listOrdersController = listOrdersController;
const order_service_1 = require("../services/order.service");
const response_1 = require("../utils/response");
async function listOrdersController(_req, res) { return (0, response_1.sendSuccess)(res, await (0, order_service_1.listOrders)()); }
