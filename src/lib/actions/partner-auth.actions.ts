"use server";

import { connectToDatabase } from "@/lib/db/mongoose";
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
      account.failedLoginAttempts += 1;
      if (account.failedLoginAttempts >= 5) {
        account.lockoutUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
      }
      await account.save();
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
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to sign in." };
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
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to claim invitation." };
  }
}

export async function logoutPartnerAction(): Promise<PartnerActionResult> {
  await clearPartnerSessionCookie();
  return { success: true };
}
