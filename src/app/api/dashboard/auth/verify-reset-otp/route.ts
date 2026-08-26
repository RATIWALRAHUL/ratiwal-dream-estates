import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { DashboardAuthService } from "@/lib/services/dashboard-auth.service";
import { AuditLog } from "@/models/AuditLog";
import { connectToDatabase } from "@/lib/db/mongoose";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { identifier, otp } = body;

    if (!identifier || !otp) {
      return NextResponse.json(
        { success: false, message: "Identifier and 6-digit verification code are required." },
        { status: 400 }
      );
    }

    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "Unknown";

    const result = await DashboardAuthService.verifyResetOtp(identifier, otp.trim());

    await connectToDatabase();

    if (!result.success || !result.resetToken) {
      try {
        await AuditLog.create({
          actorId: "ANONYMOUS",
          actorRole: "SYSTEM",
          action: "PASSWORD_RESET_OTP_FAILED",
          metadata: { identifier: DashboardAuthService.maskIdentifier(identifier), ipAddress, userAgent, error: result.error },
          timestamp: new Date(),
        });
      } catch {}

      return NextResponse.json(
        { success: false, message: result.error || "Invalid or expired verification code." },
        { status: 400 }
      );
    }

    // Set restricted reset session cookie (expires in 15 mins)
    const cookieStore = await cookies();
    const isProduction = process.env.NODE_ENV === "production";

    cookieStore.set("admin_reset_session", result.resetToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60, // 15 minutes
    });

    try {
      await AuditLog.create({
        actorId: "ANONYMOUS",
        actorRole: "SYSTEM",
        action: "PASSWORD_RESET_OTP_VERIFIED",
        metadata: { identifier: DashboardAuthService.maskIdentifier(identifier), ipAddress, userAgent },
        timestamp: new Date(),
      });
    } catch {}

    return NextResponse.json({
      success: true,
      resetToken: result.resetToken,
      message: "Verification code confirmed. You may now set a new password.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred during OTP verification." },
      { status: 500 }
    );
  }
}
