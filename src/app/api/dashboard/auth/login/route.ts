import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { DashboardAuthService } from "@/lib/services/dashboard-auth.service";
import { AuditLog } from "@/models/AuditLog";
import { connectToDatabase } from "@/lib/db/mongoose";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { identifier, password, rememberDevice } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, message: "Identifier and password are required." },
        { status: 400 }
      );
    }

    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "Unknown";

    const result = await DashboardAuthService.authenticateAdmin(identifier, password, {
      ipAddress,
      userAgent,
    });

    await connectToDatabase();

    if (!result.success || !result.account) {
      // Record audit failure
      try {
        await AuditLog.create({
          actorId: "ANONYMOUS",
          actorRole: "SYSTEM",
          action: "DASHBOARD_LOGIN_FAILED",
          metadata: {
            identifier: DashboardAuthService.maskIdentifier(identifier),
            ipAddress,
            userAgent,
            reason: result.error || "Invalid credentials",
          },
          timestamp: new Date(),
        });
      } catch {}

      return NextResponse.json(
        {
          success: false,
          message: result.error || "Unable to sign in with the provided credentials.",
        },
        { status: 401 }
      );
    }

    if (result.requiresMfa) {
      return NextResponse.json({
        success: true,
        requiresMfa: true,
        mfaToken: result.mfaToken,
        message: "Multi-factor authentication required.",
      });
    }

    // Set secure session cookie
    const cookieStore = await cookies();
    const isProduction = process.env.NODE_ENV === "production";
    const maxAge = rememberDevice ? 7 * 24 * 60 * 60 : 12 * 60 * 60; // 7 days or 12 hours

    cookieStore.set("admin_session", result.sessionToken!, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge,
    });

    // Record audit success
    try {
      await AuditLog.create({
        actorId: result.account._id.toString(),
        actorRole: result.account.role,
        actorEmail: result.account.email,
        action: "DASHBOARD_LOGIN_SUCCEEDED",
        metadata: {
          email: result.account.email,
          role: result.account.role,
          ipAddress,
          userAgent,
        },
        timestamp: new Date(),
      });
    } catch {}

    return NextResponse.json({
      success: true,
      requiresMfa: false,
      user: {
        id: result.account._id.toString(),
        name: result.account.name,
        email: result.account.email,
        role: result.account.role,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred during sign in." },
      { status: 500 }
    );
  }
}
