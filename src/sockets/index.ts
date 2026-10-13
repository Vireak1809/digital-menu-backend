import type { Server as HttpServer } from 'node:http';
import { Server, type Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { prisma } from '../config/prisma';
import type { AccessPayload } from '../middleware/auth';

let io: Server | null = null;

export function getIO() {
  return io;
}

export function initSockets(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: { origin: env.corsOrigins, credentials: true },
    path: '/socket.io',
  });

  io.on('connection', (socket: Socket) => {
    // Authenticated staff/chef join privileged rooms.
    const token = socket.handshake.auth?.token as string | undefined;
    if (token) {
      try {
        const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessPayload;
        if (payload.role === 'ADMIN' || payload.role === 'STAFF') socket.join('admin');
        if (payload.role === 'CHEF') socket.join('chef');
        if (payload.role === 'ADMIN') socket.join('chef'); // admins may watch the KDS
        socket.data.user = payload;
      } catch {
        /* ignore invalid tokens — customer sockets stay anonymous */
      }
    }

    // Customers join a table room by presenting the non-guessable QR token.
    socket.on('join:table', async ({ qrToken }: { qrToken: string }) => {
      if (!qrToken || typeof qrToken !== 'string') return;
      const table = await prisma.table.findUnique({ where: { qrToken }, select: { id: true } });
      if (table) socket.join(`table:${table.id}`);
    });

    socket.on('leave:table', ({ tableId }: { tableId: string }) => {
      if (typeof tableId === 'string') socket.leave(`table:${tableId}`);
    });
  });

  return io;
}