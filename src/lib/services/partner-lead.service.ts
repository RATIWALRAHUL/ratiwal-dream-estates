import "server-only";

import { createHash } from "crypto";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { PartnerSession } from "@/types/partner";
import { PartnerGuard } from "@/lib/auth/partner-guard";
import { ChannelPartner } from "@/models/ChannelPartner";
import { Property } from "@/models/Property";
import { Lead } from "@/models/Lead";
import { PartnerLeadSubmission, IPartnerLeadSubmission } from "@/models/PartnerLeadSubmission";
import { LeadAttributionClaim } from "@/models/LeadAttributionClaim";
import { CommunicationOutboxService } from "@/lib/services/communication-outbox.service";
import { logAuditEvent } from "@/lib/services/audit.service";

export interface SubmitPartnerLeadInput {
  propertyId: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  budgetBand?: string;
  investmentIntent?: "IMMEDIATE_REGISTRY" | "VILLA_CONSTRUCTION" | "LONG_TERM_APPRECIATION" | "COMMERCIAL";
  notes?: string;
  consentConfirmed: boolean;
}

export class PartnerLeadService {
  /**
   * Generates a deterministic SHA-256 hash for phone number deduplication
   */
  public static hashPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, "");
    const normalized = cleaned.length >= 10 ? `+91${cleaned.slice(-10)}` : `+91${cleaned}`;
    return createHash("sha256").update(normalized).digest("hex");
  }

  /**
   * Generates a deterministic SHA-256 hash for email deduplication
   */
  public static hashEmail(email?: string): string | undefined {
    if (!email) return undefined;
    const normalized = email.trim().toLowerCase();
    return createHash("sha256").update(normalized).digest("hex");
  }

  /**
   * Masks a customer name for privacy (e.g., "Rajesh Sharma" -> "Rajesh S****")
   */
  public static maskName(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].slice(0, 2) + "****";
    }
    return `${parts[0]} ${parts[parts.length - 1].slice(0, 1)}****`;
  }

  /**
   * Masks a phone number (e.g., "+919876543210" -> "+91 98*** **210")
   */
  public static maskPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length < 10) return "****";
    const last3 = cleaned.slice(-3);
    const first2 = cleaned.slice(-10, -8);
    return `+91 ${first2}*** **${last3}`;
  }

  /**
   * Registers a customer lead submission from a channel partner
   */
  public static async submitLead(
    session: PartnerSession,
    input: SubmitPartnerLeadInput
  ): Promise<{
    submission: IPartnerLeadSubmission;
    statusMessage: string;
  }> {
    // 1. Assert partner is active & authorized for property
    await PartnerGuard.assertPartnerPropertyAccess(session, input.propertyId);
    await connectToDatabase();

    if (!input.consentConfirmed) {
      throw new Error("CONSENT_REQUIRED: You must confirm that you have obtained verifiable customer representation consent.");
    }

    const partner = await ChannelPartner.findById(session.user.partnerId);
    if (!partner || partner.status !== "ACTIVE") {
      throw new Error("ACCESS_DENIED: Only active, fully compliant channel partners can register leads.");
    }

    const property = await Property.findById(input.propertyId).select("title locationId");
    if (!property) {
      throw new Error("NOT_FOUND: Property not found.");
    }

    const clientPhoneHash = this.hashPhone(input.clientPhone);
    const clientEmailHash = this.hashEmail(input.clientEmail);
    const clientNameMasked = this.maskName(input.clientName);
    const clientPhoneMasked = this.maskPhone(input.clientPhone);
    const clientEmailMasked = input.clientEmail
      ? input.clientEmail.replace(/(.{2})(.*)(@.*)/, "$1***$3")
      : undefined;

    // 2. Perform zero-PII deduplication check
    const cleanedPhone = input.clientPhone.replace(/\D/g, "");
    const normalizedPhone = cleanedPhone.length >= 10 ? `+91${cleanedPhone.slice(-10)}` : `+91${cleanedPhone}`;

    const existingCrmLead = await Lead.findOne({
      normalizedPhone,
    }).lean();

    // Check for prior partner submissions within active attribution window (60 days)
    const windowStart = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    const priorSubmission = await PartnerLeadSubmission.findOne({
      clientPhoneHash,
      submittedAt: { $gte: windowStart },
      attributionStatus: { $in: ["ACCEPTED", "SUBMITTED", "PENDING_DEDUPLICATION"] },
    }).lean();

    let isDuplicate = false;
    let conflictType: "DIRECT_LEAD" | "ANOTHER_PARTNER_LEAD" | "EXISTING_CUSTOMER" | undefined;

    if (priorSubmission && priorSubmission.partnerId.toString() !== partner._id.toString()) {
      isDuplicate = true;
      conflictType = "ANOTHER_PARTNER_LEAD";
    } else if (existingCrmLead) {
      isDuplicate = true;
      conflictType = "DIRECT_LEAD";
    }

    const count = await PartnerLeadSubmission.countDocuments();
    const submissionNumber = `RDE-PLS-${String(count + 1).padStart(6, "0")}`;
    const attributionExpiryDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

    const submission = await PartnerLeadSubmission.create({
      submissionNumber,
      partnerId: partner._id,
      partnerAccountId: new Types.ObjectId(session.user.id),
      propertyId: property._id,
      locationId: property.locationId,
      clientNameMasked,
      clientPhoneMasked,
      clientPhoneHash,
      clientEmailMasked,
      clientEmailHash,
      budgetBand: input.budgetBand,
      investmentIntent: input.investmentIntent || "IMMEDIATE_REGISTRY",
      notes: input.notes?.trim(),
      consentConfirmed: true,
      consentStatementVersion: "v2026.1-DPDP-PARTNER-REPRESENTATION",
      consentDeclarationText: "I certify that this prospective buyer explicitly authorized Ratiwal Dream Estates to contact them regarding plotted land investments.",
      consentTimestamp: new Date(),
      attributionStatus: isDuplicate ? "CONFLICT" : "ACCEPTED",
      safeStatusForPartner: isDuplicate ? "UNDER_REVIEW" : "ACCEPTED",
      linkedCrmLeadId: existingCrmLead?._id,
      deduplicationResult: {
        matchFound: isDuplicate,
        existingRecordType: conflictType,
        attributionWindowActive: isDuplicate,
      },
      attributionExpiryDate,
      submittedAt: new Date(),
    });

    // 3. If clean, create or link CRM Lead and Attribution Claim
    if (!isDuplicate) {
      let crmLead = existingCrmLead;
      if (!crmLead) {
        crmLead = await Lead.create({
          referenceNumber: `RDE-LD-${Date.now().toString(36).toUpperCase()}`,
          fullName: input.clientName.trim(),
          normalizedPhone,
          displayPhone: input.clientPhone.trim(),
          normalizedEmail: input.clientEmail?.toLowerCase().trim(),
          displayEmail: input.clientEmail?.trim(),
          preferredContactMethod: "PHONE",
          propertyId: property._id,
          locationId: property.locationId,
          status: "NEW",
          priority: "NORMAL",
          source: "OTHER",
          consentGranted: true,
          consentTextVersion: "1.0-PARTNER-REPRESENTED",
          privacyPolicyVersion: "1.0",
          consentPurpose: `Channel Partner Lead Registration via ${partner.partnerCode}`,
          consentTimestamp: new Date(),
          consentSource: `PARTNER_${partner.partnerCode}`,
        });
      }

      submission.linkedCrmLeadId = crmLead._id;
      await submission.save();

      // Create Attribution Claim
      const claimCount = await LeadAttributionClaim.countDocuments();
      const claimNumber = `RDE-LAC-${String(claimCount + 1).padStart(6, "0")}`;

      await LeadAttributionClaim.create({
        claimNumber,
        leadId: crmLead._id,
        partnerId: partner._id,
        submissionId: submission._id,
        policyVersion: "v2026.1-STANDARD-ATTRIBUTION",
        attributionStart: new Date(),
        attributionEnd: attributionExpiryDate,
        status: "ACCEPTED",
        decisionReason: "Automated direct match with zero deduplication conflict.",
      });
    }

    // 4. Enqueue internal sales desk alert
    await CommunicationOutboxService.enqueueEvent({
      eventType: isDuplicate ? "PARTNER_LEAD_CONFLICT_INTERNAL" : "PARTNER_LEAD_SUBMITTED_INTERNAL",
      aggregateType: "LEAD",
      aggregateId: submission._id.toString(),
      recipientType: "ADMIN_POOL",
      recipientEmail: "leads@ratiwaldreamestates.com",
      recipientName: "Ratiwal Sales & Attribution Desk",
      variables: {
        submissionNumber,
        partnerCode: partner.partnerCode,
        partnerName: partner.displayName,
        propertyTitle: property.title,
        isDuplicate,
      },
    });

    // 5. Audit Log
    await logAuditEvent({
      actor: { id: session.user.id, role: "PARTNER", email: session.user.email, name: session.user.name },
      action: "PARTNER_LEAD_SUBMITTED",
      targetPartnerId: partner._id,
      targetLeadSubmissionId: submission._id,
      reason: `Partner ${partner.partnerCode} registered lead submission ${submissionNumber}`,
    });

    const statusMessage = isDuplicate
      ? "Lead submission received and placed under compliance review."
      : "Lead successfully registered and attributed to your partner account.";

    return { submission, statusMessage };
  }

  /**
   * Resolves an attribution conflict (Staff Action)
   */
  public static async resolveAttributionClaim(params: {
    claimId: string;
    decision: "ACCEPTED" | "REJECTED" | "OVERRIDDEN";
    reason: string;
    actorId: string;
    actorName: string;
    actorEmail: string;
  }) {
    await connectToDatabase();

    const claim = await LeadAttributionClaim.findById(params.claimId);
    if (!claim) {
      throw new Error("NOT_FOUND: Attribution claim not found.");
    }

    claim.status = params.decision;
    claim.decisionReason = params.reason.trim();
    claim.reviewedBy = params.actorId;
    claim.reviewedByName = params.actorName;
    claim.reviewedTimestamp = new Date();

    if (params.decision === "OVERRIDDEN") {
      claim.isOverridden = true;
      claim.overrideReason = params.reason.trim();
      claim.overriddenBy = params.actorName;
      claim.overriddenAt = new Date();
    }

    await claim.save();

    // Update submission safe status
    const submission = await PartnerLeadSubmission.findById(claim.submissionId);
    if (submission) {
      submission.attributionStatus = params.decision === "ACCEPTED" || params.decision === "OVERRIDDEN" ? "ACCEPTED" : "REJECTED";
      submission.safeStatusForPartner = params.decision === "ACCEPTED" || params.decision === "OVERRIDDEN" ? "ACCEPTED" : "CLOSED_LOST";
      await submission.save();
    }

    await logAuditEvent({
      actor: { id: params.actorId, role: "SUPER_ADMIN", email: params.actorEmail, name: params.actorName, isActive: true },
      action: "PARTNER_LEAD_ATTRIBUTED",
      targetPartnerId: claim.partnerId,
      targetAttributionClaimId: claim._id,
      reason: `Attribution claim ${claim.claimNumber} resolved as ${params.decision}: ${params.reason}`,
    });

    return claim;
  }
}
