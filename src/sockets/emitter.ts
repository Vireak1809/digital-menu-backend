import { getIO } from './index';

export function emitToRoom(room: string, event: string, payload: unknown) {
  getIO()?.to(room).emit(event, payload);
}

export function emitToAll(event: string, payload: unknown) {
  getIO()?.emit(event, payload);
}