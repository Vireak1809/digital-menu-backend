"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setSocketServer = setSocketServer;
exports.emitEvent = emitEvent;
let socketServer;
function setSocketServer(server) { socketServer = server; }
function emitEvent(event, payload) { socketServer?.emit(event, payload); }
