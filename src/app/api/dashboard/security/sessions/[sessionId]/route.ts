import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { DashboardAuthService } from "@/lib/services/dashboard-auth.service";
import { AuditLog } from "@/models/AuditLog";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const { sessionId } = await params;
    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: "Session ID is required." },
        { status: 400 }
      );
    }

    const revoked = await DashboardAuthService.revokeSession(session.user.id, sessionId);
    if (!revoked) {
      return NextResponse.json(
        { success: false, message: "Session not found or already revoked." },
        { status: 404 }
      );
    }

    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "Unknown";

    try {
      await AuditLog.create({
        actorId: session.user.id,
        actorRole: session.user.role,
        actorEmail: session.user.email,
        action: "SESSION_REVOKED",
        metadata: { ipAddress, userAgent, sessionId },
        timestamp: new Date(),
      });
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Session revoked successfully.",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
