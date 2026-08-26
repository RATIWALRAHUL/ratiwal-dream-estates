"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/db/mongoose";
import { CustomerPortalAccount } from "@/models/CustomerPortalAccount";
import {
  CUSTOMER_AUTH_COOKIE_NAME,
  createCustomerSessionToken,
  verifyCustomerPassword,
  getCustomerSession,
} from "@/lib/auth/customer-session";
import { PortalInvitationService } from "@/lib/services/portal-invitation.service";
import { logAuditEvent } from "@/lib/services/audit.service";
import { PrivacyRequest } from "@/models/PrivacyRequest";
import { PortalGuard } from "@/lib/auth/portal-guard";
import { Types } from "mongoose";

/**
 * Signs in an existing customer
 */
export async function loginCustomerAction(formData: FormData) {
  try {
    const email = (formData.get("email") as string)?.trim().toLowerCase();
    const password = formData.get("password") as string;

    if (!email || !password) {
      return { success: false, error: "Please provide your registered email address and password." };
    }

    await connectToDatabase();

    const account = await CustomerPortalAccount.findOne({ email });
    if (!account) {
      // Prevent user enumeration by generic message
      return { success: false, error: "Invalid email address or password." };
    }

    if (!account.isActive) {
      return { success: false, error: "Your portal account has been suspended. Please contact customer support." };
    }

    // Check account lockout
    if (account.lockUntil && new Date(account.lockUntil).getTime() > Date.now()) {
      return {
        success: false,
        error: "Account is temporarily locked due to multiple failed sign-in attempts. Please try again in 15 minutes.",
      };
    }

    const isValid = verifyCustomerPassword(password, account.passwordHash, account.passwordSalt);
    if (!isValid) {
      account.failedLoginAttempts += 1;
      if (account.failedLoginAttempts >= 5) {
        account.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins lock
      }
      await account.save();
      return { success: false, error: "Invalid email address or password." };
    }

    // Reset failed login counter on success
    account.failedLoginAttempts = 0;
    account.lockUntil = undefined;
    account.lastLoginAt = new Date();
    await account.save();

    const sessionToken = createCustomerSessionToken({
      id: account._id.toString(),
      email: account.email,
      phone: account.phone,
      name: account.name,
      isActive: account.isActive,
      isEmailVerified: account.isEmailVerified,
      isPhoneVerified: account.isPhoneVerified,
      lastLoginAt: account.lastLoginAt.toISOString(),
      mfaEnabled: account.mfaEnabled,
    });

    const cookieStore = await cookies();
    cookieStore.set(CUSTOMER_AUTH_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    await logAuditEvent({
      actor: { id: account._id.toString(), role: "CUSTOMER", email: account.email, name: account.name },
      action: "PORTAL_LOGIN",
      targetPortalAccountId: account._id,
      reason: `Customer signed into self-service portal`,
    });

    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message || "An unexpected error occurred during sign-in." };
  }
}

/**
 * Signs out the authenticated customer
 */
export async function logoutCustomerAction() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(CUSTOMER_AUTH_COOKIE_NAME);
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

/**
 * Claims an invitation and logs in
 */
export async function claimInvitationAction(input: {
  token: string;
  password?: string;
  name?: string;
  phone?: string;
}) {
  try {
    const res = await PortalInvitationService.claimInvitation(input);

    const cookieStore = await cookies();
    cookieStore.set(CUSTOMER_AUTH_COOKIE_NAME, res.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return { success: true, name: res.name };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

/**
 * Updates customer communication preferences
 */
export async function updateCustomerPreferencesAction(input: {
  transactionalEmail: boolean;
  transactionalWhatsapp: boolean;
  marketingConsent: boolean;
  preferredLanguage: string;
}) {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return { success: false, error: "UNAUTHORIZED: Please sign in." };
    }

    await connectToDatabase();
    const account = await CustomerPortalAccount.findById(session.user.id);
    if (!account) {
      return { success: false, error: "Account not found." };
    }

    account.communicationPreferences = {
      transactionalEmail: input.transactionalEmail,
      transactionalWhatsapp: input.transactionalWhatsapp,
      marketingConsent: input.marketingConsent,
      preferredLanguage: input.preferredLanguage || "en",
    };

    await account.save();

    await logAuditEvent({
      actor: { id: account._id.toString(), role: "CUSTOMER", email: account.email, name: account.name },
      action: "CUSTOMER_PREFERENCES_UPDATED",
      targetPortalAccountId: account._id,
      reason: `Customer updated communication preferences`,
    });

    revalidatePath("/portal/profile");
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

/**
 * Submits a profile or KYC correction request
 */
export async function submitProfileCorrectionAction(input: {
  fieldToCorrect: string;
  currentValue: string;
  requestedValue: string;
  reason: string;
}) {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return { success: false, error: "UNAUTHORIZED: Please sign in." };
    }

    const scope = await PortalGuard.resolveCustomerScope(session);
    await connectToDatabase();

    const partyId = scope.partyIds[0];
    if (!partyId) {
      return { success: false, error: "Customer profile not linked." };
    }

    const count = await PrivacyRequest.countDocuments();
    const requestNumber = `RDE-PRQ-${String(count + 1).padStart(6, "0")}`;

    await PrivacyRequest.create({
      requestNumber,
      partyId: new Types.ObjectId(partyId),
      requestType: "CORRECTION",
      status: "RECEIVED",
      requesterEmailMasked: session.user.email
        ? session.user.email.replace(/(.{2})(.*)(@.*)/, "$1***$3")
        : "cust***@ratiwal.com",
      identityVerificationMethod: "OTP_VERIFIED",
      requestDetails: `Correction for ${input.fieldToCorrect}: from "${input.currentValue}" to "${input.requestedValue}". Reason: ${input.reason}`,
      receivedAt: new Date(),
      dueByDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    revalidatePath("/portal/profile");
    revalidatePath("/portal/privacy");
    return { success: true, requestNumber };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
