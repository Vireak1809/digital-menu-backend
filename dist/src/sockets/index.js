"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachSockets = attachSockets;
const socket_io_1 = require("socket.io");
const env_1 = require("../config/env");
const emitter_1 = require("./emitter");
function attachSockets(server) {
    const io = new socket_io_1.Server(server, { cors: { origin: env_1.env.CLIENT_URL.split(",").map((origin) => origin.trim()) } });
    (0, emitter_1.setSocketServer)(io);
    return io;
}
