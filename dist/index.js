"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_http_1 = __importDefault(require("node:http"));
const app_1 = require("./app");
const env_1 = require("./config/env");
const prisma_1 = require("./config/prisma");
const sockets_1 = require("./sockets");
async function main() {
    const app = (0, app_1.createApp)();
    const server = node_http_1.default.createServer(app);
    (0, sockets_1.initSockets)(server);
    server.listen(env_1.env.PORT, () => {
        console.log(`🚀 API + Socket.IO listening on http://localhost:${env_1.env.PORT}`);
    });
    const shutdown = async (signal) => {
        console.log(`\n${signal} received — shutting down…`);
        server.close();
        await prisma_1.prisma.$disconnect();
        process.exit(0);
    };
    process.on('SIGINT', () => void shutdown('SIGINT'));
    process.on('SIGTERM', () => void shutdown('SIGTERM'));
}
main().catch((err) => {
    console.error('Fatal startup error', err);
    process.exit(1);
});
