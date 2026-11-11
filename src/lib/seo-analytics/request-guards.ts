import type { NextRequest } from "next/server";
import { AuthorizationError } from "@/lib/api/errors";

/**
 * Cookie-authenticated mutations must reject cross-origin browser requests.
 * Requests with no Origin header (non-browser clients) are allowed through here
 * but still need a valid signed admin token from the caller's auth check.
 */
export function assertSameOrigin(request: NextRequest): void {
  const origin = request.headers.get("origin");
  if (!origin) return;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  let originHost: string | null = null;
  try {
    originHost = new URL(origin).host;
  } catch {
    originHost = null;
  }
  if (!host || originHost !== host) {
    throw new AuthorizationError("Cross-origin requests are not allowed.");
  }
}
