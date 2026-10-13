import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/errors';
import { fail } from '../utils/response';
import { env } from '../config/env';

export const notFoundHandler: RequestHandler = (req, res) =>
  fail(res, 404, `Route ${req.method} ${req.originalUrl} not found`);

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    return fail(res, 422, 'Validation failed', err.flatten().fieldErrors);
  }
  if (err instanceof AppError) {
    return fail(res, err.statusCode, err.message, err.errors);
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') return fail(res, 409, 'A record with that value already exists', err.meta);
    if (err.code === 'P2025') return fail(res, 404, 'Record not found');
  }
  // eslint-disable-next-line no-console
  console.error('💥 Unhandled error:', err);
  return fail(res, 500, env.isProd ? 'Internal server error' : String(err?.message ?? err));
};