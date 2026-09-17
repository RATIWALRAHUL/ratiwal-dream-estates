import { NextRequest, NextResponse } from "next/server";

// Public auth paths under /dashboard that do not require an active session
const PUBLIC_DASHBOARD_PATHS = [
  "/dashboard/login",
  "/dashboard/forgot-password",
  "/dashboard/verify-reset-otp",
  "/dashboard/reset-password",
  "/dashboard/mfa",
  "/dashboard/auth/success",
  "/dashboard/team/invitations/accept",
];

// Public paths under /portal
const PUBLIC_PORTAL_PATHS = [
  "/portal/login",
  "/portal/claim",
];
// Public paths under /partner
const PUBLIC_PARTNER_PATHS = [
  "/partner/login",
  "/partner/claim",
];

// ─── Session secrets (Edge runtime — mirrors the Node-side getters in
// src/lib/auth/{session,customer-session,partner-session}.ts) ────────────────
//
// Each realm's dev fallback only ever applies outside production. In
// production, a missing secret returns null rather than throwing — throwing
// here would 500 every request on the site (this middleware runs on nearly
// every path, not just authenticated ones), so instead every token for that
// realm is simply treated as invalid.

function getAdminSessionSecret(): string | null {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV !== "production") {
    return "dev-only-insecure-admin-session-secret-do-not-use-in-prod";
  }
  return null;
}
function getCustomerSessionSecret(): string | null {
  const secret = process.env.CUSTOMER_SESSION_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV !== "production") {
    return "dev-only-insecure-customer-session-secret-do-not-use-in-prod";
  }
  return null;
}

function getPartnerSessionSecret(): string | null {
  const secret = process.env.PARTNER_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV !== "production") {
    return "dev-only-insecure-partner-session-secret-do-not-use-in-prod";
  }
  return null;
}

// ─── Edge-safe base64url + HMAC-SHA256 (Web Crypto, no Node `Buffer`) ────────

function base64UrlToStd(input: string): string {
  return input.replace(/-/g, "+").replace(/_/g, "/");
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decodeBase64UrlPayload(payloadB64: string): string {
  const std = base64UrlToStd(payloadB64);
  const padded = std + "=".repeat((4 - (std.length % 4)) % 4);
  return atob(padded);
}

async function hmacSha256Base64Url(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return base64UrlEncode(new Uint8Array(signatureBuffer));
}

/**
 * Verifies a `sess_<payload>.<signature>` admin session token — same format
 * and secret as src/lib/auth/session.ts. This can't be a bare structural check
 * (as it was before): middleware itself redirects /dashboard/login -> /dashboard
 * whenever it thinks a session is valid, so if middleware's notion of "valid"
 * were broader than the real verifier's (e.g. accepting an unsigned or
 * tampered token), a forged/expired cookie would bounce forever between the
 * two routes — the same redirect-loop bug class this file already had to fix
 * once for expired (but structurally well-formed) tokens.
 */
async function isValidAdminSessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token || !token.startsWith("sess_")) return false;
  const secret = getAdminSessionSecret();
  if (!secret) return false;

  try {
    const [payloadB64, signature] = token.slice(5).split(".");
    if (!payloadB64 || !signature) return false;

    const expectedSignature = await hmacSha256Base64Url(secret, payloadB64);
    if (signature !== expectedSignature) return false;

    const session = JSON.parse(decodeBase64UrlPayload(payloadB64)) as {
      user?: { isActive?: boolean };
      expiresAt?: string;
    };
    return Boolean(
      session?.user?.isActive &&
      session.expiresAt &&
      new Date(session.expiresAt).getTime() > Date.now()
    );
  } catch {
    return false;
  }
}

/** Verifies a `cust_<payload>.<signature>` customer session token (see customer-session.ts). */
async function isValidCustomerSessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token || !token.startsWith("cust_")) return false;
  const secret = getCustomerSessionSecret();
  if (!secret) return false;

  try {
    const [payloadB64, signature] = token.slice(5).split(".");
    if (!payloadB64 || !signature) return false;

    const expectedSignature = await hmacSha256Base64Url(secret, payloadB64);
    if (signature !== expectedSignature) return false;

    const session = JSON.parse(decodeBase64UrlPayload(payloadB64)) as {
      user?: { isActive?: boolean };
      expiresAt?: string;
    };
    return Boolean(
      session?.user?.isActive &&
      session.expiresAt &&
      new Date(session.expiresAt).getTime() > Date.now()
    );
  } catch {
    return false;
  }
}

/**
 * Verifies a `part_<payload>.<signature>` partner session token (see
 * partner-session.ts). Note expiresAt there is epoch *seconds*, not an ISO
 * string, and the canonical verifier doesn't check `user.isActive` at this
 * layer either (that's re-checked against the DB in getPartnerSession()) —
 * mirrored here exactly so middleware can't diverge from it.
 */
async function isValidPartnerSessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token || !token.startsWith("part_")) return false;
  const secret = getPartnerSessionSecret();
  if (!secret) return false;

  try {
    const [payloadB64, signature] = token.slice(5).split(".");
    if (!payloadB64 || !signature) return false;

    const expectedSignature = await hmacSha256Base64Url(secret, payloadB64);
    if (signature !== expectedSignature) return false;

    const payload = JSON.parse(decodeBase64UrlPayload(payloadB64)) as { expiresAt?: number };
    const nowSeconds = Math.floor(Date.now() / 1000);
    return Boolean(payload?.expiresAt && payload.expiresAt >= nowSeconds);
  } catch {
    return false;
  }
}

const DISCOVERY_LINK_HEADER =
  '</.well-known/api-catalog>; rel="service-desc"; type="application/json", </llms.txt>; rel="alternate"; type="text/markdown", </sitemap.xml>; rel="sitemap"; type="application/xml"';

const PUBLIC_MARKDOWN_PATHS = [
  "/",
  "/properties",
  "/locations",
  "/investment",
  "/about",
  "/why-choose-us",
  "/testimonials",
  "/insights",
  "/contact",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const acceptHeader = req.headers.get("accept") || "";

  // 1. Dashboard route protection
  if (pathname.startsWith("/dashboard")) {
    const isPublicDashboardPath = PUBLIC_DASHBOARD_PATHS.some(
      (publicPath) => pathname === publicPath || pathname.startsWith(`${publicPath}/`)
    );

    const adminSessionCookie =
      req.cookies.get("admin_session")?.value ||
      req.cookies.get("ratiwal_admin_token")?.value;

    const hasAdminSession = await isValidAdminSessionToken(adminSessionCookie);

    // If accessing a protected dashboard route without a session, redirect to login
    if (!isPublicDashboardPath && !hasAdminSession) {
      const loginUrl = new URL("/dashboard/login", req.url);
      if (pathname !== "/dashboard") {
        loginUrl.searchParams.set("from", pathname);
      }
      const response = NextResponse.redirect(loginUrl);
      // Clear any stale/expired/malformed session cookie so it can't keep
      // bouncing this request between /dashboard and /dashboard/login.
      if (adminSessionCookie) {
        response.cookies.delete("admin_session");
        response.cookies.delete("ratiwal_admin_token");
      }
      return response;
    }

    // If accessing the login page while already authenticated, redirect to /dashboard
    if (pathname === "/dashboard/login" && hasAdminSession) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  }

  // 2. Customer Portal route protection
  if (pathname.startsWith("/portal")) {
    const isPublicPortalPath = PUBLIC_PORTAL_PATHS.some(
      (publicPath) => pathname === publicPath || pathname.startsWith(`${publicPath}/`)
    );

    // NOTE: the real cookie set on login is "ratiwal_customer_token" (see
    // customer-session.ts). This previously checked a "portal_session" cookie
    // that nothing in the app ever sets, so every authenticated customer was
    // redirected straight back to /portal/login on every request.
    const customerSessionCookie = req.cookies.get("ratiwal_customer_token")?.value;
    const hasPortalSession = await isValidCustomerSessionToken(customerSessionCookie);

    if (!isPublicPortalPath && !hasPortalSession) {
      const response = NextResponse.redirect(new URL("/portal/login", req.url));
      if (customerSessionCookie) {
        response.cookies.delete("ratiwal_customer_token");
      }
      return response;
    }

    if (pathname === "/portal/login" && hasPortalSession) {
      return NextResponse.redirect(new URL("/portal", req.url));
    }

    return NextResponse.next();
  }

  // 3. Partner Portal route protection
  if (pathname.startsWith("/partner")) {
    const isPublicPartnerPath = PUBLIC_PARTNER_PATHS.some(
      (publicPath) => pathname === publicPath || pathname.startsWith(`${publicPath}/`)
    );

    // NOTE: the real cookie set on login is "ratiwal_partner_token" (see
    // partner-session.ts) — same class of bug as the portal branch above.
    const partnerSessionCookie = req.cookies.get("ratiwal_partner_token")?.value;
    const hasPartnerSession = await isValidPartnerSessionToken(partnerSessionCookie);

    if (!isPublicPartnerPath && !hasPartnerSession) {
      const response = NextResponse.redirect(new URL("/partner/login", req.url));
      if (partnerSessionCookie) {
        response.cookies.delete("ratiwal_partner_token");
      }
      return response;
    }

    if (pathname === "/partner/login" && hasPartnerSession) {
      return NextResponse.redirect(new URL("/partner", req.url));
    }

    return NextResponse.next();
  }

  // 4. Markdown Content Negotiation for AI Agents and LLMs
  const isPublicContentRoute =
    PUBLIC_MARKDOWN_PATHS.includes(pathname) ||
    pathname.startsWith("/properties/") ||
    pathname.startsWith("/locations/") ||
    pathname.startsWith("/insights/") ||
    pathname.startsWith("/testimonials/");

  if (isPublicContentRoute && acceptHeader.includes("text/markdown")) {
    const negotiationUrl = new URL(`/api/content-negotiation`, req.url);
    negotiationUrl.searchParams.set("path", pathname);
    return NextResponse.rewrite(negotiationUrl);
  }

  // 5. Injected RFC 8288 Discovery Headers on Public HTML Pages
  const response = NextResponse.next();

  if (isPublicContentRoute) {
    response.headers.set("Link", DISCOVERY_LINK_HEADER);
    response.headers.set("Vary", "Accept");
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, favicon.png, sitemap.xml, robots.txt, llms.txt
     * - public images/assets (png, jpg, jpeg, gif, svg, webp)
     */
    "/((?!_next/static|_next/image|favicon|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
