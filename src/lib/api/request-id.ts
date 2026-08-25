import { randomUUID } from "node:crypto";

/**
 * Validates whether a provided string is a valid UUID v4 format.
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Generates a cryptographically secure UUID v4 request ID.
 */
export function generateRequestId(): string {
  return randomUUID();
}

/**
 * Extracts a request ID from incoming headers if it is a valid UUID,
 * otherwise generates a new unique ID.
 */
export function getOrGenerateRequestId(request?: Request | Headers | null): string {
  if (!request) {
    return generateRequestId();
  }

  const headers = request instanceof Headers ? request : request.headers;
  const candidate =
    headers.get("x-request-id") ||
    headers.get("x-correlation-id");

  if (candidate && UUID_REGEX.test(candidate.trim())) {
    return candidate.trim();
  }

  return generateRequestId();
}
