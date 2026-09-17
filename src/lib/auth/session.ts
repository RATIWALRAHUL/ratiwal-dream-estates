import { cookies, headers } from "next/headers";
import { cache } from "react";
import crypto from "crypto";

/**
 * Secret used to HMAC-sign admin session tokens. Must be set in production —
 * without this, session tokens were previously just base64url JSON with no
 * signature at all, meaning anyone could hand-craft a cookie claiming to be a
 * SUPER_ADMIN. The dev fallback only ever applies outside production.
 */
function getAdminSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV !== "production") {
    return "dev-only-insecure-admin-session-secret-do-not-use-in-prod";
  }
  throw new Error(
    "ADMIN_SESSION_SECRET must be set in production — refusing to sign or verify admin sessions without it."
  );
}

export type AdminRole = "ADMIN" | "EDITOR" | "SUPER_ADMIN";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  isActive: boolean;
  lastLoginAt?: string;
}

export interface AdminSession {
  user: AdminUser;
  expiresAt: string;
  token?: string;
}

/**
 * Cookie and header constants for admin authentication
 */
export const ADMIN_AUTH_COOKIE_NAME = "ratiwal_admin_token";
export const ADMIN_AUTH_HEADER_NAME = "x-admin-token";
export const DEV_ADMIN_OVERRIDE_HEADER = "x-dev-admin-session";

/**
 * Parses and verifies an admin session from cookies, headers, or verified test context.
 * In a production setup, this validates the JWT / Iron Session token against a secret.
 * 
 * Note: If no token or valid session is present, this returns null.
 */
async function getAdminSessionUncached(): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies();
    const headersList = await headers();

    // 1. Check for token in secure HTTP-only cookies
    const cookieToken = cookieStore.get("admin_session")?.value || cookieStore.get(ADMIN_AUTH_COOKIE_NAME)?.value;

    // 2. Check for token in authorization header (for API requests / integrations)
    const headerToken = headersList.get(ADMIN_AUTH_HEADER_NAME) || 
      headersList.get("authorization")?.replace(/^Bearer\s+/i, "");

    const token = cookieToken || headerToken;

    // 3. Check for development / test environment session simulation
    const devOverride = headersList.get(DEV_ADMIN_OVERRIDE_HEADER);
    if (process.env.NODE_ENV === "development" && devOverride) {
      try {
        const parsedUser = JSON.parse(devOverride) as AdminUser;
        if (parsedUser && parsedUser.role && parsedUser.isActive) {
          return {
            user: parsedUser,
            expiresAt: new Date(Date.now() + 86400000).toISOString(),
            token: "dev-simulated-token",
          };
        }
      } catch {
        // Ignore invalid JSON in dev header
      }
    }

    if (!token) {
      // In development mode, if specifically configured via DEV_ADMIN_ENABLED env variable,
      // provide a default super admin session for easy local development.
      if (process.env.NODE_ENV === "development" && process.env.DEV_ADMIN_AUTO_AUTH === "true") {
        return {
          user: {
            id: "dev-admin-001",
            email: "admin@ratiwaldreamestates.com",
            name: "Ratiwal Principal Admin",
            role: "SUPER_ADMIN",
            isActive: true,
            lastLoginAt: new Date().toISOString(),
          },
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
          token: "dev-auto-token",
        };
      }
      return null;
    }

    // Parse and verify the signed session token (sess_<payload>.<hmac-signature>)
    try {
      if (token.startsWith("sess_")) {
        const [payload, signature] = token.slice(5).split(".");
        if (!payload || !signature) return null;

        const expectedSignature = crypto
          .createHmac("sha256", getAdminSessionSecret())
          .update(payload)
          .digest("base64url");

        const signatureBuf = Buffer.from(signature);
        const expectedBuf = Buffer.from(expectedSignature);
        if (
          signatureBuf.length !== expectedBuf.length ||
          !crypto.timingSafeEqual(signatureBuf, expectedBuf)
        ) {
          return null;
        }

        const payloadStr = Buffer.from(payload, "base64url").toString("utf-8");
        const sessionData = JSON.parse(payloadStr) as AdminSession;
        if (
          sessionData?.user &&
          sessionData.user.isActive &&
          new Date(sessionData.expiresAt).getTime() > Date.now()
        ) {
          return sessionData;
        }
      }
    } catch {
      return null;
    }

    return null;
  } catch {
    // When running in CLI / test environments outside of Next.js HTTP request scope,
    // if DEV_ADMIN_AUTO_AUTH is enabled, provide the test admin session.
    if (process.env.NODE_ENV === "development" && process.env.DEV_ADMIN_AUTO_AUTH === "true") {
      return {
        user: {
          id: "dev-admin-001",
          email: "admin@ratiwaldreamestates.com",
          name: "Ratiwal Principal Admin",
          role: "SUPER_ADMIN",
          isActive: true,
          lastLoginAt: new Date().toISOString(),
        },
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        token: "dev-auto-token",
      };
    }
    return null;
  }
}

/**
 * Request-scoped memoized admin session lookup
 */
export const getAdminSession = cache(getAdminSessionUncached);

/**
 * Creates a signed, HMAC-authenticated admin session token.
 */
export function createSessionToken(user: AdminUser, expiresInMs = 86400000): string {
  const session: AdminSession = {
    user,
    expiresAt: new Date(Date.now() + expiresInMs).toISOString(),
  };
  const payload = Buffer.from(JSON.stringify(session), "utf-8").toString("base64url");
  const signature = crypto.createHmac("sha256", getAdminSessionSecret()).update(payload).digest("base64url");
  return `sess_${payload}.${signature}`;
}

export async function requireAdminSession(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) {
    throw new Error("UNAUTHORIZED: Active admin session required.");
  }
  return session;
}

export const requireSession = requireAdminSession;

export async function requireRole(allowedRoles: AdminRole[]): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) {
    throw new Error("UNAUTHORIZED: Active admin session required.");
  }
  if (!allowedRoles.includes(session.user.role)) {
    throw new Error("FORBIDDEN: Insufficient permissions.");
  }
  return session;
}

