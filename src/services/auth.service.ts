import { createHash, timingSafeEqual } from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';
import { env } from '../config/env';
import { conflict, forbidden, unauthorized } from '../utils/errors';
import { signAccessToken, type AccessPayload } from '../middleware/auth';

interface RefreshPayload {
  sub: string;
  tokenVersion: string;
}

export async function getInitialAdminSetupStatus() {
  if (!env.FIRST_ADMIN_SETUP_KEY) return { available: false };
  return { available: (await prisma.user.count()) === 0 };
}

export async function createInitialAdmin(input: {
  name: string;
  email: string;
  password: string;
  setupKey: string;
}) {
  const configuredKey = env.FIRST_ADMIN_SETUP_KEY;
  if (!configuredKey) throw forbidden('First admin setup is not enabled');

  const suppliedHash = createHash('sha256').update(input.setupKey).digest();
  const configuredHash = createHash('sha256').update(configuredKey).digest();
  if (!timingSafeEqual(suppliedHash, configuredHash)) throw unauthorized('Invalid setup key');

  const passwordHash = await bcrypt.hash(input.password, 10);
  try {
    return await prisma.$transaction(async (tx: Pick<typeof prisma, 'user'>) => {
      if ((await tx.user.count()) !== 0) throw conflict('Initial admin setup is already completed');
      return tx.user.create({
        data: {
          name: input.name.trim(),
          email: input.email.trim().toLowerCase(),
          passwordHash,
          role: 'ADMIN',
          isActive: true,
        },
      });
    }, { isolationLevel: 'Serializable' });
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2034') {
      throw conflict('Initial admin setup is already completed');
    }
    throw error;
  }
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