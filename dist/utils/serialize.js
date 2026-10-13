"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serialize = serialize;
const library_1 = require("@prisma/client/runtime/library");
/** Recursively converts Prisma Decimal -> number and Date -> ISO string. */
function serialize(value) {
    if (value === null || value === undefined)
        return value;
    if (value instanceof Date)
        return value.toISOString();
    if (library_1.Decimal.isDecimal(value))
        return value.toNumber();
    if (Array.isArray(value))
        return value.map(serialize);
    if (typeof value === 'object') {
        const out = {};
        for (const [k, v] of Object.entries(value))
            out[k] = serialize(v);
        return out;
    }
    return value;
}
