"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderRouter = void 0;
const express_1 = require("express");
const order_controller_1 = require("../controllers/order.controller");
const auth_1 = require("../middleware/auth");
const async_1 = require("../utils/async");
exports.orderRouter = (0, express_1.Router)();
exports.orderRouter.get("/", auth_1.requireAuth, (0, async_1.asyncHandler)(order_controller_1.listOrdersController));
