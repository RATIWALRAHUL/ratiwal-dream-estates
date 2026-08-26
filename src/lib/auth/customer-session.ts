import { cookies, headers } from "next/headers";
import crypto from "crypto";
import { CustomerSession, CustomerUser } from "@/types/portal";

export const CUSTOMER_AUTH_COOKIE_NAME = "ratiwal_customer_token";
export const CUSTOMER_AUTH_HEADER_NAME = "x-customer-token";
export const DEV_CUSTOMER_OVERRIDE_HEADER = "x-dev-customer-session";

const SESSION_SECRET = process.env.CUSTOMER_SESSION_SECRET || "ratiwal_customer_portal_session_secret_2026_super_secure";

/**
 * Hash password with PBKDF2
 */
export function hashCustomerPassword(password: string, salt?: string): { hash: string; salt: string } {
  const generatedSalt = salt || crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, generatedSalt, 10000, 64, "sha512")
    .toString("hex");
  return { hash, salt: generatedSalt };
}

/**
 * Verify customer password against stored hash & salt
 */
export function verifyCustomerPassword(password: string, hash: string, salt: string): boolean {
  const { hash: computedHash } = hashCustomerPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(computedHash, "hex"), Buffer.from(hash, "hex"));
}

/**
 * Creates a signed customer session token
 */
export function createCustomerSessionToken(user: CustomerUser, expiresInMs: number = 7 * 24 * 60 * 60 * 1000): string {
  const expiresAt = new Date(Date.now() + expiresInMs).toISOString();
  const payload = {
    user: {
      id: user.id,
      email: user.email,
      phone: user.phone,
      name: user.name,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
      lastLoginAt: user.lastLoginAt,
      mfaEnabled: user.mfaEnabled,
    },
    expiresAt,
  };

  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(payloadBase64)
    .digest("base64url");

  return `cust_${payloadBase64}.${signature}`;
}

/**
 * Parses and verifies a customer session token
 */
export function verifyCustomerSessionToken(token: string): CustomerSession | null {
  try {
    if (!token.startsWith("cust_")) return null;
    const tokenPart = token.slice(5);
    const [payloadBase64, signature] = tokenPart.split(".");
    if (!payloadBase64 || !signature) return null;

    const expectedSignature = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(payloadBase64)
      .digest("base64url");

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }

    const payloadJson = Buffer.from(payloadBase64, "base64url").toString("utf-8");
    const session = JSON.parse(payloadJson) as CustomerSession;

    if (new Date(session.expiresAt).getTime() <= Date.now()) {
      return null;
    }

    if (!session.user || !session.user.isActive) {
      return null;
    }

    return {
      ...session,
      token,
    };
  } catch {
    return null;
  }
}

/**
 * Retrieves the authenticated customer session from cookies, headers, or test override
 */
export async function getCustomerSession(): Promise<CustomerSession | null> {
  try {
    const cookieStore = await cookies();
    const headersList = await headers();

    // 1. Check secure cookie
    const cookieToken = cookieStore.get(CUSTOMER_AUTH_COOKIE_NAME)?.value;

    // 2. Check authorization header
    const headerToken =
      headersList.get(CUSTOMER_AUTH_HEADER_NAME) ||
      headersList.get("x-customer-auth") ||
      headersList.get("authorization")?.replace(/^Bearer\s+/i, "");

    const token = cookieToken || headerToken;

    // 3. Check dev simulation header (non-production only)
    const devOverride = headersList.get(DEV_CUSTOMER_OVERRIDE_HEADER);
    if (process.env.NODE_ENV !== "production" && devOverride) {
      try {
        const parsedUser = JSON.parse(devOverride) as CustomerUser;
        if (parsedUser && parsedUser.id && parsedUser.isActive) {
          return {
            user: parsedUser,
            expiresAt: new Date(Date.now() + 86400000).toISOString(),
            token: "dev-customer-simulated-token",
          };
        }
      } catch {
        // Ignore invalid json
      }
    }

    if (!token) return null;

    return verifyCustomerSessionToken(token);
  } catch {
    return null;
  }
}

/**
 * Require customer session or throw error
 */
export async function requireCustomerSession(): Promise<CustomerSession> {
  const session = await getCustomerSession();
  if (!session) {
    throw new Error("UNAUTHORIZED: Customer sign-in required.");
  }
  return session;
}
