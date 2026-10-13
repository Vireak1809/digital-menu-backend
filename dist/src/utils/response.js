"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccess = sendSuccess;
function sendSuccess(res, data, statusCode = 200) {
    return res.status(statusCode).json({ success: true, data });
}
