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

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

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

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/portal/:path*",
    "/partner/:path*",
  ],
};
