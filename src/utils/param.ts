import type { Request } from 'express';

export function readParam(req: Request, name: string) {
  const value = req.params[name];
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}
