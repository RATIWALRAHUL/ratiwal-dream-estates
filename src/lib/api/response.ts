import { NextResponse } from "next/server";
import { ZodError } from "zod";
import type { ApiErrorResponse, ApiSuccessResponse, ValidationFieldErrors } from "@/types/api";
import { isAppError } from "./errors";
import { generateRequestId } from "./request-id";

export interface SuccessResponseOptions {
  status?: number;
  requestId?: string;
  headers?: HeadersInit;
}

export interface ErrorResponseOptions {
  status?: number;
  requestId?: string;
  headers?: HeadersInit;
}

/**
 * Returns a standardized JSON success response.
 */
export function successResponse<T>(
  data: T,
  options: SuccessResponseOptions = {}
): NextResponse<ApiSuccessResponse<T>> {
  const { status = 200, requestId = generateRequestId(), headers } = options;

  const body: ApiSuccessResponse<T> = {
    success: true,
    data,
    requestId,
  };

  const responseHeaders = new Headers(headers);
  responseHeaders.set("x-request-id", requestId);

  return NextResponse.json(body, {
    status,
    headers: responseHeaders,
  });
}

/**
 * Converts a ZodError into the standard field errors map.
 */
export function formatZodFieldErrors(zodError: ZodError): ValidationFieldErrors {
  const fields: ValidationFieldErrors = {};

  for (const issue of zodError.issues) {
    const path = issue.path.join(".") || "root";
    if (!fields[path]) {
      fields[path] = [];
    }
    fields[path].push(issue.message);
  }

  return fields;
}

/**
 * Returns a standardized JSON error response.
 * Sanitizes internal details so sensitive system information is never leaked.
 */
export function errorResponse(
  error: unknown,
  options: ErrorResponseOptions = {}
): NextResponse<ApiErrorResponse> {
  const requestId = options.requestId || generateRequestId();
  let status = options.status || 500;
  let code: ApiErrorResponse["error"]["code"] = "INTERNAL_SERVER_ERROR";
  let message = "An unexpected error occurred. Please try again later.";
  let fields: ValidationFieldErrors | undefined = undefined;

  if (isAppError(error)) {
    status = options.status || error.status;
    code = error.code;
    message = error.message;
    fields = error.fields;
  } else if (error instanceof ZodError) {
    status = 400;
    code = "VALIDATION_ERROR";
    message = "The submitted information is invalid.";
    fields = formatZodFieldErrors(error);
  } else if (error instanceof SyntaxError && "body" in error) {
    // Malformed JSON payload
    status = 400;
    code = "VALIDATION_ERROR";
    message = "Invalid JSON in request body.";
  }

  const body: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(fields ? { fields } : {}),
    },
    requestId,
  };

  const responseHeaders = new Headers(options.headers);
  responseHeaders.set("x-request-id", requestId);

  return NextResponse.json(body, {
    status,
    headers: responseHeaders,
  });
}
