import type { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { ok } from '../utils/response';
import { env } from '../config/env';
import { unauthorized } from '../utils/errors';

const REFRESH_COOKIE = 'refresh_token';

const cookieOptions = {
  httpOnly: true,
  secure: env.isProd,
  sameSite: 'lax' as const,
  path: '/api/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  res.cookie(REFRESH_COOKIE, result.refreshToken, cookieOptions);
  return ok(res, { accessToken: result.accessToken, user: result.user }, 'Logged in');
}

export async function initialAdminSetupStatus(_req: Request, res: Response) {
  return ok(res, await authService.getInitialAdminSetupStatus());
}

export async function createInitialAdmin(req: Request, res: Response) {
  await authService.createInitialAdmin(req.body);
  return ok(res, null, 'Initial admin created');
}

export async function refresh(req: Request, res: Response) {
  const result = await authService.refresh(req.cookies?.[REFRESH_COOKIE]);
  if (!result) throw unauthorized('Session expired');
  res.cookie(REFRESH_COOKIE, result.refreshToken, cookieOptions);
  return ok(res, { accessToken: result.accessToken, user: result.user }, 'Token refreshed');
}

export async function logout(req: Request, res: Response) {
  if (req.user) await authService.logout(req.user.sub);
  res.clearCookie(REFRESH_COOKIE, { ...cookieOptions, maxAge: undefined });
  return ok(res, null, 'Logged out');
}

export async function me(req: Request, res: Response) {
  if (!req.user) throw unauthorized();
  return ok(res, req.user);
}