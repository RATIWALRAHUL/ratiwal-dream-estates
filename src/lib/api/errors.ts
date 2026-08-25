import type { ApiErrorCode, ValidationFieldErrors } from "@/types/api";

export interface AppErrorOptions {
  status?: number;
  code?: ApiErrorCode;
  fields?: ValidationFieldErrors;
  cause?: unknown;
}

/**
 * Base Application Error class for domain and API errors.
 */
export class AppError extends Error {
  public readonly status: number;
  public readonly code: ApiErrorCode;
  public readonly fields?: ValidationFieldErrors;
  public override readonly cause?: unknown;

  constructor(message: string, options: AppErrorOptions = {}) {
    super(message);
    this.name = this.constructor.name;
    this.status = options.status ?? 500;
    this.code = options.code ?? "INTERNAL_SERVER_ERROR";
    this.fields = options.fields;
    this.cause = options.cause;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(
    message = "The submitted information is invalid.",
    fields?: ValidationFieldErrors,
    cause?: unknown
  ) {
    super(message, {
      status: 400,
      code: "VALIDATION_ERROR",
      fields,
      cause,
    });
  }
}

export class AuthenticationError extends AppError {
  constructor(
    message = "Authentication required to access this resource.",
    cause?: unknown
  ) {
    super(message, {
      status: 401,
      code: "AUTHENTICATION_ERROR",
      cause,
    });
  }
}

export class AuthorizationError extends AppError {
  constructor(
    message = "You do not have permission to access this resource.",
    cause?: unknown
  ) {
    super(message, {
      status: 403,
      code: "AUTHORIZATION_ERROR",
      cause,
    });
  }
}

export class NotFoundError extends AppError {
  constructor(
    message = "The requested resource was not found.",
    cause?: unknown
  ) {
    super(message, {
      status: 404,
      code: "NOT_FOUND",
      cause,
    });
  }
}

export class ConflictError extends AppError {
  constructor(
    message = "The request could not be completed due to a resource conflict.",
    cause?: unknown
  ) {
    super(message, {
      status: 409,
      code: "CONFLICT",
      cause,
    });
  }
}

export class RateLimitError extends AppError {
  constructor(
    message = "Too many requests. Please slow down and try again later.",
    cause?: unknown
  ) {
    super(message, {
      status: 429,
      code: "RATE_LIMIT_EXCEEDED",
      cause,
    });
  }
}

export class DatabaseError extends AppError {
  constructor(
    message = "A database operation failed.",
    cause?: unknown
  ) {
    super(message, {
      status: 500,
      code: "DATABASE_ERROR",
      cause,
    });
  }
}

export class InternalServerError extends AppError {
  constructor(
    message = "An unexpected internal server error occurred.",
    cause?: unknown
  ) {
    super(message, {
      status: 500,
      code: "INTERNAL_SERVER_ERROR",
      cause,
    });
  }
}

/**
 * Type guard to check if an unknown error is an instance of AppError.
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
