"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serialize = serialize;
function serialize(value) {
    return JSON.parse(JSON.stringify(value));
}
