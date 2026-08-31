"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongoose";
import { ChannelPartner } from "@/models/ChannelPartner";

import { PartnerPropertyAccess } from "@/models/PartnerPropertyAccess";

import { PartnerInvitationService } from "@/lib/services/partner-invitation.service";
import { PartnerLifecycleService } from "@/lib/services/partner-lifecycle.service";

import { PartnerPayoutService } from "@/lib/services/partner-payout.service";
import { PartnerActionResult } from "./partner-auth.actions";
import { PartnerType, PartnerStatus } from "@/types/partner";
import { Types } from "mongoose";

// ─── 1. Create Partner Organization (Staff Action) ───────────────────────────

export async function createChannelPartnerAction(formData: FormData): Promise<PartnerActionResult> {
  try {
    const session = await requireSession();
    await connectToDatabase();

    const legalName = formData.get("legalName")?.toString()?.trim();
    const displayName = formData.get("displayName")?.toString()?.trim() || legalName;
    const partnerType = formData.get("partnerType")?.toString() as PartnerType;
    const email = formData.get("email")?.toString()?.trim().toLowerCase();
    const phone = formData.get("phone")?.toString()?.trim();
    const city = formData.get("city")?.toString()?.trim() || "Jaipur";
    const state = formData.get("state")?.toString()?.trim() || "Rajasthan";
    const pincode = formData.get("pincode")?.toString()?.trim() || "302001";
    const addressLine1 = formData.get("addressLine1")?.toString()?.trim() || "Main Office";
    const primaryContactName = formData.get("primaryContactName")?.toString()?.trim() || displayName;

    if (!legalName || !email || !phone || !partnerType) {
      return { success: false, error: "Please complete all mandatory fields." };
    }

    const count = await ChannelPartner.countDocuments();
    const partnerCode = `RDE-CP-${String(count + 100001).slice(1)}`;

    const partner = await ChannelPartner.create({
      partnerCode,
      partnerType,
      legalName,
      displayName,
      email,
      phone,
      registeredAddress: {
        addressLine1,
        city,
        state,
        pincode,
        country: "India",
      },
      jurisdictionState: state,
      operatingLocations: [city.toLowerCase()],
      primaryContact: {
        name: primaryContactName,
        email,
        phone,
      },
      status: "DRAFT",
      complianceStatus: "DRAFT",
      reraRequired: partnerType !== "REFERRAL_PARTNER",
      createdBy: session.user.id,
      createdByName: session.user.name,
    });

    revalidatePath("/dashboard/partners");
    return { success: true, data: { partnerId: partner._id.toString(), partnerCode } };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create partner." };
  }
}

// ─── 2. Send Partner Invitation ───────────────────────────────────────────────

export async function sendPartnerInvitationAction(formData: FormData): Promise<PartnerActionResult> {
  try {
    const session = await requireSession();

    const partnerId = formData.get("partnerId")?.toString()?.trim();
    const invitedEmail = formData.get("invitedEmail")?.toString()?.trim();
    const invitedName = formData.get("invitedName")?.toString()?.trim();
    const invitedPhone = formData.get("invitedPhone")?.toString()?.trim();

    if (!partnerId || !invitedEmail || !invitedName) {
      return { success: false, error: "Partner, email, and name are required." };
    }

    const { invitation, inviteUrl } = await PartnerInvitationService.sendInvitation({
      partnerId,
      invitedEmail,
      invitedName,
      invitedPhone,
      actorId: session.user.id,
      actorName: session.user.name,
    });

    revalidatePath(`/dashboard/partners/${partnerId}`);
    revalidatePath("/dashboard/partners");

    return {
      success: true,
      data: {
        invitationNumber: invitation.invitationNumber,
        inviteUrl,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to send invitation." };
  }
}

// ─── 3. Review Partner Compliance ─────────────────────────────────────────────

export async function reviewPartnerComplianceAction(formData: FormData): Promise<PartnerActionResult> {
  try {
    const session = await requireSession();

    const partnerId = formData.get("partnerId")?.toString()?.trim();
    const reviewType = formData.get("reviewType")?.toString(); // "RERA" | "TAX" | "PAYOUT" | "STATUS"
    const status = formData.get("status")?.toString() as any;
    const reason = formData.get("reason")?.toString()?.trim();

    if (!partnerId || !reviewType || !status) {
      return { success: false, error: "Missing mandatory review parameters." };
    }

    if (reviewType === "STATUS") {
      await PartnerLifecycleService.transitionStatus({
        partnerId,
        newStatus: status as PartnerStatus,
        reason,
        actorId: session.user.id,
        actorName: session.user.name,
        actorEmail: session.user.email,
      });
    } else if (reviewType === "RERA") {
      const verificationMethod = formData.get("verificationMethod")?.toString() as any || "INTERNAL_DOCUMENT_CHECK";
      const officialSourceUrl = formData.get("officialSourceUrl")?.toString()?.trim();

      await PartnerLifecycleService.reviewReraRegistration({
        partnerId,
        status,
        verificationMethod,
        officialSourceUrl,
        notes: reason,
        actorId: session.user.id,
        actorName: session.user.name,
        actorEmail: session.user.email,
      });
    } else if (reviewType === "TAX") {
      await PartnerLifecycleService.reviewTaxProfile({
        partnerId,
        status,
        rejectionReason: reason,
        actorId: session.user.id,
        actorName: session.user.name,
        actorEmail: session.user.email,
      });
    } else if (reviewType === "PAYOUT") {
      const profileId = formData.get("profileId")?.toString()?.trim() || partnerId;
      await PartnerLifecycleService.reviewPayoutProfile({
        profileId,
        status,
        rejectionReason: reason,
        actorId: session.user.id,
        actorName: session.user.name,
        actorEmail: session.user.email,
      });
    }

    revalidatePath(`/dashboard/partners/${partnerId}`);
    revalidatePath("/dashboard/partners");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Compliance review update failed." };
  }
}

// ─── 4. Assign Property Access & Commission Plan ──────────────────────────────

export async function grantPartnerPropertyAccessAction(formData: FormData): Promise<PartnerActionResult> {
  try {
    const session = await requireSession();
    await connectToDatabase();

    const partnerId = formData.get("partnerId")?.toString()?.trim();
    const propertyId = formData.get("propertyId")?.toString()?.trim();
    const accessLevel = formData.get("accessLevel")?.toString() as any || "FULL_MARKETING";

    if (!partnerId || !propertyId) {
      return { success: false, error: "Partner and Property IDs required." };
    }

    await PartnerPropertyAccess.findOneAndUpdate(
      { partnerId: new Types.ObjectId(partnerId), propertyId: new Types.ObjectId(propertyId) },
      {
        partnerId: new Types.ObjectId(partnerId),
        propertyId: new Types.ObjectId(propertyId),
        accessLevel,
        effectiveDate: new Date(),
        isActive: true,
        grantedBy: session.user.id,
        grantedByName: session.user.name,
      },
      { upsert: true, new: true }
    );

    revalidatePath(`/dashboard/partners/${partnerId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to grant property access." };
  }
}

// ─── 5. Payout Maker-Checker Actions ──────────────────────────────────────────

export async function createCommissionPayoutAction(formData: FormData): Promise<PartnerActionResult> {
  try {
    const session = await requireSession();

    const partnerId = formData.get("partnerId")?.toString()?.trim();
    const accrualIds = formData.getAll("accrualIds").map((id) => id.toString().trim());

    if (!partnerId || accrualIds.length === 0) {
      return { success: false, error: "Please select at least one eligible commission accrual." };
    }

    const payout = await PartnerPayoutService.createPayoutDraft({
      partnerId,
      accrualIds,
      actorId: session.user.id,
      actorName: session.user.name,
    });

    revalidatePath("/dashboard/commissions");
    revalidatePath("/dashboard/commissions/payouts");

    return { success: true, data: { payoutId: payout._id.toString(), payoutNumber: payout.payoutNumber } };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to draft payout." };
  }
}

export async function approveCommissionPayoutAction(formData: FormData): Promise<PartnerActionResult> {
  try {
    const session = await requireSession();
    const payoutId = formData.get("payoutId")?.toString()?.trim();

    if (!payoutId) {
      return { success: false, error: "Payout ID required." };
    }

    const payout = await PartnerPayoutService.approvePayout({
      payoutId,
      actorId: session.user.id,
      actorName: session.user.name,
    });

    revalidatePath("/dashboard/commissions");
    revalidatePath("/dashboard/commissions/payouts");

    return { success: true, data: { payoutNumber: payout.payoutNumber } };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to approve payout." };
  }
}

export async function processCommissionPayoutAction(formData: FormData): Promise<PartnerActionResult> {
  try {
    const session = await requireSession();
    const payoutId = formData.get("payoutId")?.toString()?.trim();
    const bankReferenceNumber = formData.get("bankReferenceNumber")?.toString()?.trim();

    if (!payoutId || !bankReferenceNumber) {
      return { success: false, error: "Payout ID and bank UTR reference are mandatory." };
    }

    const payout = await PartnerPayoutService.processPayout({
      payoutId,
      bankReferenceNumber,
      actorId: session.user.id,
      actorName: session.user.name,
    });

    revalidatePath("/dashboard/commissions");
    revalidatePath("/dashboard/commissions/payouts");

    return { success: true, data: { payoutNumber: payout.payoutNumber } };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to mark payout as processed." };
  }
}
