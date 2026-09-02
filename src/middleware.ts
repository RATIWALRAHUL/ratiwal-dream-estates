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

export function middleware(req: NextRequest) {
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

    const hasAdminSession = Boolean(adminSessionCookie && adminSessionCookie.startsWith("sess_"));

    // If accessing a protected dashboard route without a session, redirect to login
    if (!isPublicDashboardPath && !hasAdminSession) {
      const loginUrl = new URL("/dashboard/login", req.url);
      if (pathname !== "/dashboard") {
        loginUrl.searchParams.set("from", pathname);
      }
      return NextResponse.redirect(loginUrl);
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

    const portalSessionCookie = req.cookies.get("portal_session")?.value;
    const hasPortalSession = Boolean(portalSessionCookie);

    if (!isPublicPortalPath && !hasPortalSession) {
      return NextResponse.redirect(new URL("/portal/login", req.url));
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

    const partnerSessionCookie =
      req.cookies.get("partner_session")?.value || req.cookies.get("portal_session")?.value;
    const hasPartnerSession = Boolean(partnerSessionCookie);

    if (!isPublicPartnerPath && !hasPartnerSession) {
      return NextResponse.redirect(new URL("/partner/login", req.url));
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
