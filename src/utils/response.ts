import type { Response } from 'express';
import { serialize } from './serialize';

export function ok(res: Response, data: unknown = null, message = 'OK', status = 200) {
  return res.status(status).json({ success: true, data: serialize(data), message, errors: null });
}

export function fail(res: Response, status: number, message: string, errors: unknown = null) {
  return res.status(status).json({ success: false, data: null, message, errors });
}