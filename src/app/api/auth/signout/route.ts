import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

async function handleSignOut(req: NextRequest) {
  const cookieStore = await cookies();

  // Clear all potential auth cookies
  cookieStore.delete("admin_session");
  cookieStore.delete("admin_reset_session");
  cookieStore.delete("portal_session");
  cookieStore.delete("next-auth.session-token");
  cookieStore.delete("__Secure-next-auth.session-token");
  cookieStore.delete("next-auth.csrf-token");
  cookieStore.delete("next-auth.callback-url");

  // Redirect to homepage
  return NextResponse.redirect(new URL("/", req.url));
}

export async function GET(req: NextRequest) {
  return handleSignOut(req);
}

export async function POST(req: NextRequest) {
  return handleSignOut(req);
}
