"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const zod_1 = require("zod");
const errors_1 = require("../utils/errors");
const errorHandler = (error, _req, res, _next) => {
    if (error instanceof zod_1.ZodError) {
        res.status(400).json({ success: false, message: "Validation failed", errors: error.issues });
        return;
    }
    const statusCode = error instanceof errors_1.AppError ? error.statusCode : 500;
    if (statusCode === 500)
        console.error(error);
    res.status(statusCode).json({ success: false, message: statusCode === 500 ? "Internal server error" : error.message });
};
exports.errorHandler = errorHandler;
