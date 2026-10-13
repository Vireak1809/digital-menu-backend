"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ok = ok;
exports.fail = fail;
const serialize_1 = require("./serialize");
function ok(res, data = null, message = 'OK', status = 200) {
    return res.status(status).json({ success: true, data: (0, serialize_1.serialize)(data), message, errors: null });
}
function fail(res, status, message, errors = null) {
    return res.status(status).json({ success: false, data: null, message, errors });
}
