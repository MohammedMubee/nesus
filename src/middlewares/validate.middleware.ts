import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ApiError } from '../utils/ApiError.js';

export const validate =
  (schema: {
    body?: AnyZodObject;
    query?: AnyZodObject;
    params?: AnyZodObject;
  }) =>
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }
      if (schema.query) {
        req.query = await schema.query.parseAsync(req.query);
      }
      if (schema.params) {
        req.params = await schema.params.parseAsync(req.params);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message
        }));
        next(ApiError.badRequest('Validation failed', formattedErrors));
      } else {
        next(error);
      }
    }
  };

