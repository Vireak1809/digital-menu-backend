import type { RequestHandler } from 'express';
import type { ZodTypeAny } from 'zod';

interface Schemas {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
}

export const validate =
  (schemas: Schemas): RequestHandler =>
  (req, _res, next) => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.params) req.params = schemas.params.parse(req.params) as any;
      if (schemas.query) {
        Object.defineProperty(req, 'query', {
          configurable: true,
          enumerable: true,
          value: schemas.query.parse(req.query),
          writable: true,
        });
      }
      next();
    } catch (err) {
      next(err);
    }
  };