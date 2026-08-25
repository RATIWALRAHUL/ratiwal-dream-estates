import "server-only";

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
  requestId?: string;
  route?: string;
  category?: string;
  [key: string]: unknown;
}

const SENSITIVE_KEYS = new Set([
  "password",
  "pass",
  "secret",
  "token",
  "authorization",
  "cookie",
  "otp",
  "apikey",
  "api_key",
  "mongodb_uri",
  "uri",
  "credentials",
]);

/**
 * Deeply sanitizes an object to redact sensitive keys and prevent credential leaks.
 */
function sanitizeData(data: unknown, depth = 0): unknown {
  if (depth > 5) {
    return "[Nested]";
  }

  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === "string") {
    // Redact mongodb connection strings
    if (data.includes("mongodb://") || data.includes("mongodb+srv://")) {
      return "[REDACTED_DATABASE_URI]";
    }
    return data;
  }

  if (typeof data !== "object") {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeData(item, depth + 1));
  }

  if (data instanceof Error) {
    return {
      name: data.name,
      message: sanitizeData(data.message, depth + 1),
      stack: process.env.NODE_ENV === "development" ? data.stack : undefined,
    };
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      sanitized[key] = "[REDACTED]";
    } else {
      sanitized[key] = sanitizeData(value, depth + 1);
    }
  }

  return sanitized;
}

/**
 * Formats and writes structured logs to the standard console stream.
 */
function logMessage(level: LogLevel, message: string, context?: LogContext) {
  const isDev = process.env.NODE_ENV !== "production";

  if (level === "debug" && !isDev) {
    return;
  }

  const timestamp = new Date().toISOString();
  const safeContext = context ? (sanitizeData(context) as LogContext) : {};

  const payload = {
    timestamp,
    level,
    message: typeof message === "string" && (message.includes("mongodb://") || message.includes("mongodb+srv://"))
      ? "[REDACTED_DATABASE_URI]"
      : message,
    ...safeContext,
  };

  const output = JSON.stringify(payload);

  switch (level) {
    case "error":
      console.error(output);
      break;
    case "warn":
      console.warn(output);
      break;
    case "debug":
      console.debug(output);
      break;
    case "info":
    default:
      console.log(output);
      break;
  }
}

export const logger = {
  debug: (message: string, context?: LogContext) => logMessage("debug", message, context),
  info: (message: string, context?: LogContext) => logMessage("info", message, context),
  warn: (message: string, context?: LogContext) => logMessage("warn", message, context),
  error: (message: string, context?: LogContext) => logMessage("error", message, context),
};
