"use server";

import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { DashboardAuthService } from "@/lib/services/dashboard-auth.service";
import {
  ADMIN_AUTH_COOKIE_NAME,
  getAdminSession,
  requireAdminSession,
  createSessionToken,
  AdminUser,
} from "@/lib/auth/session";
import { logAuditEvent } from "@/lib/services/audit.service";
import { AdminAuthAccount } from "@/models/AdminAuthAccount";
import { connectToDatabase } from "@/lib/db/mongoose";

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Ignore in non-request contexts
  }
}

/**
 * Signs in an administrator using Email or Mobile Number + Password
 */
export async function loginAdminAction(formData: FormData) {
  try {
    const identifier = (formData.get("identifier") as string)?.trim();
    const password = formData.get("password") as string;
    const rememberDevice = formData.get("rememberDevice") === "true" || formData.get("rememberDevice") === "on";

    if (!identifier || !password) {
      return { success: false, error: "Please enter your registered email/phone and password." };
    }

    const headersList = await headers();
    const userAgent = headersList.get("user-agent") || "Unknown";
    const ipAddress =
      headersList.get("x-forwarded-for")?.split(",")[0] ||
      headersList.get("x-real-ip") ||
      "127.0.0.1";

    const result = await DashboardAuthService.authenticateAdmin(identifier, password, {
      userAgent,
      ipAddress,
    });

    if (!result.success) {
      return { success: false, error: result.error || "Unable to sign in with the provided credentials." };
    }

    if (result.requiresMfa) {
      return {
        success: true,
        requiresMfa: true,
        mfaToken: result.mfaToken,
        accountEmail: result.account?.email,
      };
    }

    if (result.sessionToken && result.account) {
      const maxAge = rememberDevice ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60; // 30 days vs 7 days
      const cookieStore = await cookies();
      cookieStore.set(ADMIN_AUTH_COOKIE_NAME, result.sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge,
        path: "/",
      });

      await logAuditEvent({
        actor: {
          id: result.account._id.toString(),
          role: result.account.role,
          email: result.account.email,
          name: result.account.name,
        },
        action: "ADMIN_LOGIN",
        reason: "Administrator successfully signed into Ratiwal Control Center",
      });

      return { success: true, requiresMfa: false };
    }

    return { success: false, error: "Unexpected authentication state." };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "We couldn't complete this request. Please try again.",
    };
  }
}

/**
 * Verifies privileged administrator MFA code (TOTP or Recovery Code)
 */
export async function verifyAdminMfaAction(formData: FormData) {
  try {
    const email = (formData.get("email") as string)?.trim().toLowerCase();
    const code = (formData.get("code") as string)?.trim();
    const isRecovery = formData.get("isRecovery") === "true";

    if (!email || !code) {
      return { success: false, error: "Please enter your verification code." };
    }

    await connectToDatabase();
    const account = await AdminAuthAccount.findOne({ email, isActive: true });
    if (!account) {
      return { success: false, error: "Invalid verification code or session expired." };
    }

    let isValid = false;
    if (isRecovery) {
      // Check recovery codes
      const hashedCode = DashboardAuthService.hashOtp(code);
      if (account.mfaRecoveryCodes?.includes(hashedCode)) {
        isValid = true;
        // Consume one-time recovery code
        account.mfaRecoveryCodes = account.mfaRecoveryCodes.filter((c) => c !== hashedCode);
        await account.save();
      }
    } else {
      // TOTP
      isValid = DashboardAuthService.verifyTotp(account.mfaSecret || "1234567890abcdef1234567890abcdef", code);
    }

    if (!isValid) {
      return { success: false, error: "The verification code is incorrect or has expired." };
    }

    const headersList = await headers();
    const userAgent = headersList.get("user-agent") || "Unknown";
    const ipAddress =
      headersList.get("x-forwarded-for")?.split(",")[0] ||
      headersList.get("x-real-ip") ||
      "127.0.0.1";

    const adminUser: AdminUser = {
      id: account._id.toString(),
      email: account.email,
      name: account.name,
      role: account.role,
      isActive: account.isActive,
      lastLoginAt: new Date().toISOString(),
    };

    const rawToken = createSessionToken(adminUser);
    await DashboardAuthService.recordActiveSession(account._id.toString(), rawToken, {
      userAgent,
      ipAddress,
    });

    const cookieStore = await cookies();
    cookieStore.set(ADMIN_AUTH_COOKIE_NAME, rawToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    await logAuditEvent({
      actor: {
        id: account._id.toString(),
        role: account.role,
        email: account.email,
        name: account.name,
      },
      action: "ADMIN_MFA_VERIFIED",
      reason: `MFA verified using ${isRecovery ? "backup recovery code" : "authenticator TOTP"}`,
    });

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "MFA verification failed." };
  }
}

/**
 * Requests password reset OTP
 */
export async function requestAdminPasswordResetAction(formData: FormData) {
  try {
    const identifier = (formData.get("identifier") as string)?.trim();
    if (!identifier) {
      return { success: false, error: "Please enter your registered email address or mobile number." };
    }

    const result = await DashboardAuthService.requestPasswordReset(identifier);
    return result;
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Failed to process password recovery request. Please try again.",
      maskedRecipient: "",
    };
  }
}

/**
 * Resends password reset OTP with cooldown verification
 */
export async function resendAdminResetOtpAction(formData: FormData) {
  try {
    const identifier = (formData.get("identifier") as string)?.trim();
    if (!identifier) {
      return { success: false, error: "Identifier is required." };
    }

    const result = await DashboardAuthService.requestPasswordReset(identifier);
    return result;
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to resend code." };
  }
}

export async function verifyAdminResetOtpAction(
  formData: FormData
): Promise<{ success: boolean; resetToken?: string; error?: string }> {
  try {
    const identifier = (formData.get("identifier") as string)?.trim();
    const otp = (formData.get("otp") as string)?.trim();

    if (!identifier || !otp) {
      return { success: false, error: "Please enter the 6-digit code sent to your device." };
    }

    const result = await DashboardAuthService.verifyResetOtp(identifier, otp);
    return result;
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to verify code." };
  }
}

/**
 * Sets new password using verified single-use reset token
 */
export async function resetAdminPasswordAction(formData: FormData) {
  try {
    const identifier = (formData.get("identifier") as string)?.trim();
    const resetToken = (formData.get("resetToken") as string)?.trim();
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!identifier || !resetToken || !newPassword) {
      return { success: false, error: "All fields are required." };
    }

    if (newPassword !== confirmPassword) {
      return { success: false, error: "New password and confirmation do not match." };
    }

    const result = await DashboardAuthService.resetPasswordWithToken(identifier, resetToken, newPassword);
    if (!result.success) {
      return result;
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to reset password." };
  }
}

/**
 * Retrieves list of active sessions for the current logged-in administrator
 */
export async function getAdminSessionsAction() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return { success: false, sessions: [], error: "Unauthorized" };
    }

    const cookieStore = await cookies();
    const cookieToken = cookieStore.get(ADMIN_AUTH_COOKIE_NAME)?.value;

    const sessions = await DashboardAuthService.getActiveSessions(session.user.id, cookieToken);
    return { success: true, sessions };
  } catch (err: any) {
    return { success: false, sessions: [], error: err?.message || "Failed to load sessions." };
  }
}

/**
 * Revokes a specific active session
 */
export async function revokeAdminSessionAction(sessionId: string) {
  try {
    const session = await requireAdminSession();
    const success = await DashboardAuthService.revokeSession(session.user.id, sessionId);
    safeRevalidate("/dashboard/security/sessions");
    return { success };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to revoke session." };
  }
}

/**
 * Revokes all other active sessions (with optional password re-authentication)
 */
export async function revokeAllOtherAdminSessionsAction(password?: string) {
  try {
    const session = await requireAdminSession();
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get(ADMIN_AUTH_COOKIE_NAME)?.value || "";

    if (password) {
      await connectToDatabase();
      const account = await AdminAuthAccount.findById(session.user.id);
      if (account) {
        const isMatch = DashboardAuthService.verifyPassword(password, account.passwordHash, account.passwordSalt);
        if (!isMatch) {
          return { success: false, error: "Password verification failed. Unable to terminate other sessions." };
        }
      }
    }

    const revokedCount = await DashboardAuthService.revokeAllOtherSessions(session.user.id, cookieToken);
    safeRevalidate("/dashboard/security/sessions");

    return { success: true, revokedCount };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to revoke other sessions." };
  }
}

/**
 * Logs out the administrator and clears auth cookie
 */
export async function logoutAdminAction() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(ADMIN_AUTH_COOKIE_NAME);
  } catch {
    // Ignore cookie store errors
  }
  redirect("/dashboard/login");
}
