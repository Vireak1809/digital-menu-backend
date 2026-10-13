import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';
import { env } from '../config/env';
import { unauthorized } from '../utils/errors';
import { signAccessToken, type AccessPayload } from '../middleware/auth';

interface RefreshPayload {
  sub: string;
  tokenVersion: string;
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user || !user.isActive) throw unauthorized('Invalid credentials');
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw unauthorized('Invalid credentials');

  const payload: AccessPayload = {
    sub: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
  };
  const accessToken = signAccessToken(payload);
  const refreshToken = jwt.sign(
    { sub: user.id, tokenVersion: user.updatedAt.getTime().toString() } satisfies RefreshPayload,
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.REFRESH_TOKEN_TTL } as jwt.SignOptions,
  );

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshTokenHash: await bcrypt.hash(refreshToken, 10) },
  });

  return { accessToken, refreshToken, user: publicUser(user) };
}

export async function refresh(token: string | undefined) {
  if (!token) throw unauthorized('Missing refresh token');
  let payload: RefreshPayload;
  try {
    payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshPayload;
  } catch {
    throw unauthorized('Invalid refresh token');
  }
  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || !user.isActive || !user.refreshTokenHash) throw unauthorized('Session expired');
  if (user.updatedAt.getTime().toString() !== payload.tokenVersion) throw unauthorized('Session expired');

  const valid = await bcrypt.compare(token, user.refreshTokenHash);
  if (!valid) throw unauthorized('Session expired');

  return login(user.email, '').catch(() => null) ?? rotate(user.id);
}

async function rotate(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const payload: AccessPayload = { sub: user.id, role: user.role, name: user.name, email: user.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = jwt.sign(
    { sub: user.id, tokenVersion: user.updatedAt.getTime().toString() } satisfies RefreshPayload,
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.REFRESH_TOKEN_TTL } as jwt.SignOptions,
  );
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshTokenHash: await bcrypt.hash(refreshToken, 10) },
  });
  return { accessToken, refreshToken, user: publicUser(user) };
}

export async function logout(userId: string) {
  await prisma.user.update({ where: { id: userId }, data: { refreshTokenHash: null } }).catch(() => null);
}

function publicUser(u: { id: string; name: string; email: string; role: string; isActive: boolean }) {
  return { id: u.id, name: u.name, email: u.email, role: u.role, isActive: u.isActive };
}