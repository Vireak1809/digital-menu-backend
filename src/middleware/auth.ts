import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import type { Role } from '@prisma/client';
import { env } from '../config/env';
import { forbidden, unauthorized } from '../utils/errors';

export interface AccessPayload {
  sub: string;
  role: Role;
  name: string;
  email: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AccessPayload;
    }
  }
}

export function signAccessToken(payload: AccessPayload) {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.ACCESS_TOKEN_TTL } as jwt.SignOptions);
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  if (!token) return next(unauthorized('Missing access token'));
  try {
    req.user = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessPayload;
    next();
  } catch {
    next(unauthorized('Invalid or expired access token'));
  }
}

export const requireRole =
  (...roles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(unauthorized());
    if (!roles.includes(req.user.role)) return next(forbidden('Insufficient permissions'));
    next();
  };