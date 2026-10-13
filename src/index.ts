import http from 'node:http';
import { createApp } from './app';
import { env } from './config/env';
import { prisma } from './config/prisma';
import { initSockets } from './sockets';

async function main() {
  const app = createApp();
  const server = http.createServer(app);

  initSockets(server);

  server.listen(env.PORT, () => {
    console.log(`🚀 API + Socket.IO listening on http://localhost:${env.PORT}`);
  });

  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received — shutting down…`);
    server.close();
    await prisma.$disconnect();
    process.exit(0);
  };
  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

main().catch((err) => {
  console.error('Fatal startup error', err);
  process.exit(1);
});