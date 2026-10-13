export class AppError extends Error {
  statusCode: number;
  errors: unknown;
  constructor(statusCode: number, message: string, errors: unknown = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const badRequest = (m = 'Bad request', e?: unknown) => new AppError(400, m, e);
export const unauthorized = (m = 'Unauthorized') => new AppError(401, m);
export const forbidden = (m = 'Forbidden') => new AppError(403, m);
export const notFound = (m = 'Not found') => new AppError(404, m);
export const conflict = (m = 'Conflict') => new AppError(409, m);