import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminSession } from "@/lib/auth/session";
import { DashboardAuthService } from "@/lib/services/dashboard-auth.service";
import { AuditLog } from "@/models/AuditLog";

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("admin_session")?.value;

    const count = await DashboardAuthService.revokeAllOtherSessions(
      session.user.id,
      sessionToken || ""
    );

    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "Unknown";

    try {
      await AuditLog.create({
        actorId: session.user.id,
        actorRole: session.user.role,
        actorEmail: session.user.email,
        action: "ALL_SESSIONS_REVOKED",
        metadata: { ipAddress, userAgent, revokedCount: count },
        timestamp: new Date(),
      });
    } catch {}

    return NextResponse.json({
      success: true,
      revokedCount: count,
      message: `Successfully revoked ${count} other active session(s).`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
