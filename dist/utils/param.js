"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readParam = readParam;
function readParam(req, name) {
    const value = req.params[name];
    return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}
