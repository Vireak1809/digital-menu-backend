"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.conflict = exports.notFound = exports.forbidden = exports.unauthorized = exports.badRequest = exports.AppError = void 0;
class AppError extends Error {
    statusCode;
    errors;
    constructor(statusCode, message, errors = null) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
const badRequest = (m = 'Bad request', e) => new AppError(400, m, e);
exports.badRequest = badRequest;
const unauthorized = (m = 'Unauthorized') => new AppError(401, m);
exports.unauthorized = unauthorized;
const forbidden = (m = 'Forbidden') => new AppError(403, m);
exports.forbidden = forbidden;
const notFound = (m = 'Not found') => new AppError(404, m);
exports.notFound = notFound;
const conflict = (m = 'Conflict') => new AppError(409, m);
exports.conflict = conflict;
