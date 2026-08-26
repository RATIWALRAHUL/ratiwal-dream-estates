import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { DashboardAuthService } from "@/lib/services/dashboard-auth.service";
import { AuditLog } from "@/models/AuditLog";
import { connectToDatabase } from "@/lib/db/mongoose";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { identifier, newPassword, confirmPassword, resetToken: bodyResetToken } = body;

    const cookieStore = await cookies();
    const cookieResetToken = cookieStore.get("admin_reset_session")?.value;
    const resetToken = cookieResetToken || bodyResetToken;

    if (!identifier || !resetToken) {
      return NextResponse.json(
        { success: false, message: "Your reset session has expired. Please restart the password recovery flow." },
        { status: 401 }
      );
    }

    if (!newPassword || !confirmPassword) {
      return NextResponse.json(
        { success: false, message: "New password and confirmation are required." },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: "The entered passwords do not match." },
        { status: 400 }
      );
    }

    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "Unknown";

    const result = await DashboardAuthService.resetPasswordWithToken(identifier, resetToken, newPassword);

    await connectToDatabase();

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error || "Unable to reset password." },
        { status: 400 }
      );
    }

    // Clear reset cookie and existing auth cookie
    cookieStore.delete("admin_reset_session");
    cookieStore.delete("admin_session");

    try {
      await AuditLog.create({
        actorId: "ANONYMOUS",
        actorRole: "SYSTEM",
        action: "PASSWORD_RESET_COMPLETED",
        metadata: {
          identifier: DashboardAuthService.maskIdentifier(identifier),
          ipAddress,
          userAgent,
          message: "All previous active sessions revoked.",
        },
        timestamp: new Date(),
      });
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Password updated successfully. Please log in with your new credentials.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred during password reset." },
      { status: 500 }
    );
  }
}
