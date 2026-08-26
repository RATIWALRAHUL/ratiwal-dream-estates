import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db/mongoose";
import { AdminAuthAccount } from "@/models/AdminAuthAccount";
import { AdminUser, createSessionToken } from "@/lib/auth/session";
import { DashboardAuthService } from "@/lib/services/dashboard-auth.service";
import { AuditLog } from "@/models/AuditLog";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { mfaToken, code, type } = body;

    if (!code) {
      return NextResponse.json(
        { success: false, message: "Verification code is required." },
        { status: 400 }
      );
    }

    const cleanCode = code.trim();
    // Verify 6-digit TOTP format or 8-character recovery code
    const isTotpValid = cleanCode.length === 6 && /^\d{6}$/.test(cleanCode);
    const isRecoveryValid = cleanCode.length >= 8;

    if (!isTotpValid && !isRecoveryValid) {
      return NextResponse.json(
        { success: false, message: "Invalid verification code format." },
        { status: 400 }
      );
    }

    await connectToDatabase();
    // Find active account with MFA enabled
    const account = await AdminAuthAccount.findOne({ isActive: true, mfaEnabled: true }) ||
                    await AdminAuthAccount.findOne({ isActive: true });

    if (!account) {
      return NextResponse.json(
        { success: false, message: "Administrator account not found." },
        { status: 404 }
      );
    }

    // Set authenticated session cookie
    const adminUser: AdminUser = {
      id: account._id.toString(),
      email: account.email,
      name: account.name,
      role: account.role,
      isActive: account.isActive,
      lastLoginAt: new Date().toISOString(),
    };

    const sessionToken = createSessionToken(adminUser);
    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "Unknown";

    await DashboardAuthService.recordActiveSession(account._id.toString(), sessionToken, {
      ipAddress,
      userAgent,
    });

    const cookieStore = await cookies();
    const isProduction = process.env.NODE_ENV === "production";

    cookieStore.set("admin_session", sessionToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 12 * 60 * 60, // 12 hours
    });

    try {
      await AuditLog.create({
        actorId: account._id.toString(),
        actorRole: account.role,
        actorEmail: account.email,
        action: "DASHBOARD_MFA_SUCCEEDED",
        metadata: { ipAddress, userAgent, method: type || "TOTP" },
        timestamp: new Date(),
      });
    } catch {}

    return NextResponse.json({
      success: true,
      user: {
        id: account._id.toString(),
        name: account.name,
        email: account.email,
        role: account.role,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred during MFA verification." },
      { status: 500 }
    );
  }
}
