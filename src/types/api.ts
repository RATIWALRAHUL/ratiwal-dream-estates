/**
 * Standard API Error Codes
 */
export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "AUTHENTICATION_ERROR"
  | "AUTHORIZATION_ERROR"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMIT_EXCEEDED"
  | "DATABASE_ERROR"
  | "SERVICE_UNAVAILABLE"
  | "INTERNAL_SERVER_ERROR"
  // Lead CRM
  | "INVALID_STATUS_TRANSITION"
  | "INVALID_ASSIGNEE"
  | "DUPLICATE_SUBMISSION"
  | "CONSENT_REQUIRED"
  | "ALREADY_ARCHIVED"
  // Site Visit Scheduling
  | "INVALID_ADVISOR"
  | "ADVISOR_UNAVAILABLE"
  | "SLOT_UNAVAILABLE"
  | "PROPERTY_UNAVAILABLE"
  | "PAST_DATE"
  | "OUTSIDE_BOOKING_WINDOW"
  | "DUPLICATE_REQUEST";

/**
 * Field-level validation error details
 */
export type ValidationFieldErrors = Record<string, string[]>;

/**
 * Standard API Error Object structure
 */
export interface ApiErrorDetail {
  code: ApiErrorCode;
  message: string;
  fields?: ValidationFieldErrors;
}

/**
 * Standard API Success Response Envelope
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  requestId: string;
}

/**
 * Standard API Error Response Envelope
 */
export interface ApiErrorResponse {
  success: false;
  error: ApiErrorDetail;
  requestId: string;
}

/**
 * Unified API Response union
 */
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Health Check Response Payload
 */
export interface HealthCheckData {
  status: "healthy" | "degraded" | "unhealthy";
  database: "connected" | "disconnected" | "connecting" | "error";
  timestamp: string;
}
