import { NextRequest, NextResponse } from "next/server";
import { DashboardAuthService } from "@/lib/services/dashboard-auth.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { identifier } = body;

    if (!identifier) {
      return NextResponse.json(
        { success: false, message: "Identifier is required." },
        { status: 400 }
      );
    }

    const result = await DashboardAuthService.requestPasswordReset(identifier);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error || "Unable to resend OTP at this time." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      resetRequestId: result.resetRequestId,
      maskedRecipient: result.maskedRecipient,
      message: "A fresh verification code has been dispatched.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
