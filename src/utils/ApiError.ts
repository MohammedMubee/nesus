import { HttpStatus, HttpStatusCode } from '../constants/httpStatusCodes.js';

export class ApiError extends Error {
  public readonly statusCode: HttpStatusCode;
  public readonly isOperational: boolean;
  public readonly errors?: unknown[];

  constructor(
    statusCode: HttpStatusCode = HttpStatus.INTERNAL_SERVER_ERROR,
    message: string = 'Internal Server Error',
    errors: unknown[] = [],
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, errors: unknown[] = []) {
    return new ApiError(HttpStatus.BAD_REQUEST, message, errors);
  }

  static unauthorized(message: string = 'Unauthorized access') {
    return new ApiError(HttpStatus.UNAUTHORIZED, message);
  }

  static forbidden(message: string = 'Forbidden resource') {
    return new ApiError(HttpStatus.FORBIDDEN, message);
  }

  static notFound(message: string = 'Resource not found') {
    return new ApiError(HttpStatus.NOT_FOUND, message);
  }

  static conflict(message: string) {
    return new ApiError(HttpStatus.CONFLICT, message);
  }

  static unprocessable(message: string, errors: unknown[] = []) {
    return new ApiError(HttpStatus.UNPROCESSABLE_ENTITY, message, errors);
  }

  static internal(message: string = 'Internal Server Error') {
    return new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, message, [], false);
  }
}

