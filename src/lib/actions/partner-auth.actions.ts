"use server";

import { headers } from "next/headers";
import { connectToDatabase } from "@/lib/db/mongoose";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { PartnerAccount } from "@/models/PartnerAccount";
import { ChannelPartner } from "@/models/ChannelPartner";
import {
  verifyPartnerPassword,
  createPartnerSessionToken,
  setPartnerSessionCookie,
  clearPartnerSessionCookie,
} from "@/lib/auth/partner-session";
import { PartnerInvitationService } from "@/lib/services/partner-invitation.service";
import { logAuditEvent } from "@/lib/services/audit.service";

import { getErrorMessage } from "@/lib/api/errors";
export interface PartnerActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function loginPartnerAction(formData: FormData): Promise<PartnerActionResult> {
  try {
    const email = formData.get("email")?.toString().trim().toLowerCase();
    const password = formData.get("password")?.toString();

    if (!email || !password) {
      return { success: false, error: "Please provide both email and password." };
    }

    const headersList = await headers();
    const ipAddress =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headersList.get("x-real-ip") ||
      "127.0.0.1";
    const rateLimit = checkRateLimit(`auth-login:${ipAddress}`, RATE_LIMITS.AUTH_LOGIN_PER_IP.limit, RATE_LIMITS.AUTH_LOGIN_PER_IP.windowMs);
    if (!rateLimit.allowed) {
      return { success: false, error: "Too many sign-in attempts from this network. Please try again later." };
    }

    await connectToDatabase();

    const account = await PartnerAccount.findOne({ email });
    if (!account) {
      return { success: false, error: "Invalid credentials or unauthorized account." };
    }

    if (!account.isActive) {
      return { success: false, error: "Partner account is deactivated. Please contact support." };
    }

    if (account.lockoutUntil && account.lockoutUntil > new Date()) {
      return { success: false, error: "Account temporarily locked due to failed attempts. Please try again later." };
    }

    const isValid = verifyPartnerPassword(password, account.passwordHash, account.passwordSalt);
    if (!isValid) {
      // Atomic $inc so concurrent wrong-password requests can't all read the
      // same stale count and race past the lockout threshold together.
      const updated = await PartnerAccount.findByIdAndUpdate(
        account._id,
        { $inc: { failedLoginAttempts: 1 } },
        { new: true }
      );
      if (updated && updated.failedLoginAttempts >= 5) {
        await PartnerAccount.updateOne(
          { _id: account._id },
          { $set: { lockoutUntil: new Date(Date.now() + 15 * 60 * 1000) } } // 15 mins
        );
      }
      return { success: false, error: "Invalid credentials." };
    }

    // Reset failed attempts
    account.failedLoginAttempts = 0;
    account.lockoutUntil = undefined;
    account.lastLoginAt = new Date();
    await account.save();

    const partner = await ChannelPartner.findById(account.partnerId);
    if (!partner || partner.status === "DEACTIVATED" || partner.status === "ARCHIVED") {
      return { success: false, error: "Partner organization is currently inactive." };
    }

    const token = createPartnerSessionToken({
      id: account._id.toString(),
      partnerId: partner._id.toString(),
      email: account.email,
      name: account.name,
      phone: account.phone,
      partnerType: partner.partnerType,
      partnerCode: partner.partnerCode,
      companyName: partner.displayName || partner.legalName,
      isActive: account.isActive,
      isEmailVerified: account.isEmailVerified,
      isPhoneVerified: account.isPhoneVerified,
      complianceStatus: partner.complianceStatus || partner.status,
      lastLoginAt: account.lastLoginAt?.toISOString(),
    });

    await setPartnerSessionCookie(token);

    await logAuditEvent({
      actor: { id: account._id.toString(), role: "PARTNER", email: account.email, name: account.name },
      action: "PORTAL_LOGIN",
      targetPartnerId: partner._id,
      reason: `Partner user ${account.email} signed into partner portal`,
    });

    return { success: true };
  } catch (err) {
    return { success: false, error: getErrorMessage(err, "Failed to sign in.") };
  }
}

export async function claimPartnerInvitationAction(formData: FormData): Promise<PartnerActionResult> {
  try {
    const rawToken = formData.get("token")?.toString()?.trim();
    const password = formData.get("password")?.toString();
    const phone = formData.get("phone")?.toString()?.trim();

    if (!rawToken || !password) {
      return { success: false, error: "Invitation token and password are required." };
    }

    if (password.length < 8) {
      return { success: false, error: "Password must be at least 8 characters long." };
    }

    const { sessionToken } = await PartnerInvitationService.claimInvitation({
      rawToken,
      password,
      phone,
    });

    await setPartnerSessionCookie(sessionToken);
    return { success: true };
  } catch (err) {
    return { success: false, error: getErrorMessage(err, "Failed to claim invitation.") };
  }
}

export async function logoutPartnerAction(): Promise<PartnerActionResult> {
  await clearPartnerSessionCookie();
  return { success: true };
}
