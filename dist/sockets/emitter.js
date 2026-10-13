"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitToRoom = emitToRoom;
exports.emitToAll = emitToAll;
const index_1 = require("./index");
function emitToRoom(room, event, payload) {
    (0, index_1.getIO)()?.to(room).emit(event, payload);
}
function emitToAll(event, payload) {
    (0, index_1.getIO)()?.emit(event, payload);
}
