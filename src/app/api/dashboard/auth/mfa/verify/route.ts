import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { DashboardAuthService } from "@/lib/services/dashboard-auth.service";
import { AuditLog } from "@/models/AuditLog";

/**
 * API-route counterpart to verifyAdminMfaAction (src/lib/actions/dashboard-auth.actions.ts).
 * Both now delegate to DashboardAuthService.completeMfaChallenge, the single
 * source of truth for MFA verification, so this route can't diverge from the
 * server-action flow the dashboard UI actually uses.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { mfaToken, code, isRecovery, type } = body;

    if (!mfaToken || !code) {
      return NextResponse.json(
        { success: false, message: "Verification code is required." },
        { status: 400 }
      );
    }

    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "Unknown";

    const result = await DashboardAuthService.completeMfaChallenge(
      mfaToken,
      String(code),
      Boolean(isRecovery),
      { ipAddress, userAgent }
    );

    if (!result.success || !result.sessionToken || !result.account) {
      return NextResponse.json(
        { success: false, message: result.error || "The verification code is incorrect or has expired." },
        { status: 401 }
      );
    }

    const cookieStore = await cookies();
    const isProduction = process.env.NODE_ENV === "production";

    cookieStore.set("admin_session", result.sessionToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 12 * 60 * 60, // 12 hours
    });

    try {
      await AuditLog.create({
        actorId: result.account._id.toString(),
        actorRole: result.account.role,
        actorEmail: result.account.email,
        action: "DASHBOARD_MFA_SUCCEEDED",
        metadata: { ipAddress, userAgent, method: isRecovery ? "RECOVERY_CODE" : type || "TOTP" },
        timestamp: new Date(),
      });
    } catch {}

    return NextResponse.json({
      success: true,
      user: {
        id: result.account._id.toString(),
        name: result.account.name,
        email: result.account.email,
        role: result.account.role,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred during MFA verification." },
      { status: 500 }
    );
  }
}
