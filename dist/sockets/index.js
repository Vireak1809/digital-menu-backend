"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIO = getIO;
exports.initSockets = initSockets;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const prisma_1 = require("../config/prisma");
let io = null;
function getIO() {
    return io;
}
function initSockets(httpServer) {
    io = new socket_io_1.Server(httpServer, {
        cors: { origin: env_1.env.corsOrigins, credentials: true },
        path: '/socket.io',
    });
    io.on('connection', (socket) => {
        // Authenticated staff/chef join privileged rooms.
        const token = socket.handshake.auth?.token;
        if (token) {
            try {
                const payload = jsonwebtoken_1.default.verify(token, env_1.env.JWT_ACCESS_SECRET);
                if (payload.role === 'ADMIN' || payload.role === 'STAFF')
                    socket.join('admin');
                if (payload.role === 'CHEF')
                    socket.join('chef');
                if (payload.role === 'ADMIN')
                    socket.join('chef'); // admins may watch the KDS
                socket.data.user = payload;
            }
            catch {
                /* ignore invalid tokens — customer sockets stay anonymous */
            }
        }
        // Customers join a table room by presenting the non-guessable QR token.
        socket.on('join:table', async ({ qrToken }) => {
            if (!qrToken || typeof qrToken !== 'string')
                return;
            const table = await prisma_1.prisma.table.findUnique({ where: { qrToken }, select: { id: true } });
            if (table)
                socket.join(`table:${table.id}`);
        });
        socket.on('leave:table', ({ tableId }) => {
            if (typeof tableId === 'string')
                socket.leave(`table:${tableId}`);
        });
    });
    return io;
}
