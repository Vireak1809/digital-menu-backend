"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.notFoundHandler = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const errors_1 = require("../utils/errors");
const response_1 = require("../utils/response");
const env_1 = require("../config/env");
const notFoundHandler = (req, res) => (0, response_1.fail)(res, 404, `Route ${req.method} ${req.originalUrl} not found`);
exports.notFoundHandler = notFoundHandler;
const errorHandler = (err, _req, res, _next) => {
    if (err instanceof zod_1.ZodError) {
        return (0, response_1.fail)(res, 422, 'Validation failed', err.flatten().fieldErrors);
    }
    if (err instanceof errors_1.AppError) {
        return (0, response_1.fail)(res, err.statusCode, err.message, err.errors);
    }
    if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002')
            return (0, response_1.fail)(res, 409, 'A record with that value already exists', err.meta);
        if (err.code === 'P2025')
            return (0, response_1.fail)(res, 404, 'Record not found');
    }
    // eslint-disable-next-line no-console
    console.error('💥 Unhandled error:', err);
    return (0, response_1.fail)(res, 500, env_1.env.isProd ? 'Internal server error' : String(err?.message ?? err));
};
exports.errorHandler = errorHandler;
