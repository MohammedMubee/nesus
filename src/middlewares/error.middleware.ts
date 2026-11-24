import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';
import { HttpStatus } from '../constants/httpStatusCodes.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR;
  let message = 'An unexpected error occurred';
  let errors: unknown[] = [];

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors || [];
  } else if (err.name === 'ValidationError' && err instanceof mongoose.Error.ValidationError) {
    statusCode = HttpStatus.BAD_REQUEST;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e: any) => e.message);
  } else if (err.name === 'CastError' && err instanceof mongoose.Error.CastError) {
    statusCode = HttpStatus.BAD_REQUEST;
    message = `Invalid format for field "${err.path}": ${err.value}`;
  } else if ((err as any).code === 11000) {
    statusCode = HttpStatus.CONFLICT;
    const duplicateKey = Object.keys((err as any).keyValue || {}).join(', ') || 'field';
    message = `Duplicate key error: A record with that ${duplicateKey} already exists.`;
  } else {
    logger.error('Unhandled Exception:', err);
    message = err.message || message;
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: errors.length > 0 ? errors : undefined,
    stack: env.NODE_ENV === 'development' ? err.stack : undefined
  });
};
