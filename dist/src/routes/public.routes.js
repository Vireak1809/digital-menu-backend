"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicRouter = void 0;
const express_1 = require("express");
const public_controller_1 = require("../controllers/public.controller");
const async_1 = require("../utils/async");
exports.publicRouter = (0, express_1.Router)();
exports.publicRouter.get("/menu", (0, async_1.asyncHandler)(public_controller_1.menuController));
