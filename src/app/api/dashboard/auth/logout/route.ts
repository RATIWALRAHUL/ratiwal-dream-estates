import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminSession } from "@/lib/auth/session";
import { AuditLog } from "@/models/AuditLog";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = await getAdminSession();

    if (session) {
      const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "127.0.0.1";
      const userAgent = req.headers.get("user-agent") || "Unknown";

      try {
        await AuditLog.create({
          actorId: session.user.id,
          actorRole: session.user.role,
          actorEmail: session.user.email,
          action: "SESSION_REVOKED",
          metadata: { ipAddress, userAgent, reason: "User logout" },
          timestamp: new Date(),
        });
      } catch {}
    }

    cookieStore.delete("admin_session");
    cookieStore.delete("admin_reset_session");

    return NextResponse.json({
      success: true,
      message: "Signed out successfully.",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred during sign out." },
      { status: 500 }
    );
  }
}
