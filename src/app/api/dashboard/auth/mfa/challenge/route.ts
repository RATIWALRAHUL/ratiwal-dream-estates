import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      mfaMethods: ["TOTP", "RECOVERY_CODE"],
      message: "MFA challenge initialized.",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
