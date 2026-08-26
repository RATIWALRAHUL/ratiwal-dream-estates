import { NextRequest, NextResponse } from "next/server";
import { DashboardAuthService } from "@/lib/services/dashboard-auth.service";
import { AuditLog } from "@/models/AuditLog";
import { connectToDatabase } from "@/lib/db/mongoose";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { identifier } = body;

    if (!identifier || typeof identifier !== "string") {
      return NextResponse.json(
        { success: false, message: "Valid email or mobile number is required." },
        { status: 400 }
      );
    }

    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "Unknown";

    const result = await DashboardAuthService.requestPasswordReset(identifier);

    await connectToDatabase();

    // Generic response regardless of whether account exists or not
    try {
      await AuditLog.create({
        actorId: "SYSTEM",
        actorRole: "SYSTEM",
        action: "PASSWORD_RESET_REQUESTED",
        metadata: {
          identifier: DashboardAuthService.maskIdentifier(identifier),
          ipAddress,
          userAgent,
          hasRequestId: Boolean(result.resetRequestId),
        },
        timestamp: new Date(),
      });
    } catch {}

    return NextResponse.json({
      success: true,
      resetRequestId: result.resetRequestId,
      maskedRecipient: result.maskedRecipient || DashboardAuthService.maskIdentifier(identifier),
      message: "If an eligible dashboard account is associated with these details, recovery instructions will be sent.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: true,
        message: "If an eligible dashboard account is associated with these details, recovery instructions will be sent.",
      },
      { status: 200 }
    );
  }
}
