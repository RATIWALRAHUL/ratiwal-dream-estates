import "server-only";

import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { ChannelPartner, IChannelPartner } from "@/models/ChannelPartner";
import { PartnerReraRegistration } from "@/models/PartnerReraRegistration";
import { PartnerTaxProfile } from "@/models/PartnerTaxProfile";
import { PartnerPayoutProfile } from "@/models/PartnerPayoutProfile";
import { PartnerAgreement } from "@/models/PartnerAgreement";
import { CommissionPlan } from "@/models/CommissionPlan";
import { PartnerStatus, isValidPartnerStatusTransition } from "@/types/partner";
import { CommunicationOutboxService } from "@/lib/services/communication-outbox.service";
import { logAuditEvent } from "@/lib/services/audit.service";

export class PartnerLifecycleService {
  /**
   * Updates partner lifecycle status with validation and audit trail
   */
  public static async transitionStatus(params: {
    partnerId: string;
    newStatus: PartnerStatus;
    reason?: string;
    actorId: string;
    actorName: string;
    actorEmail: string;
  }): Promise<IChannelPartner> {
    await connectToDatabase();

    const partner = await ChannelPartner.findById(params.partnerId);
    if (!partner) {
      throw new Error("NOT_FOUND: Channel partner not found.");
    }

    const currentStatus = partner.status;
    if (!isValidPartnerStatusTransition(currentStatus, params.newStatus)) {
      throw new Error(
        `INVALID_TRANSITION: Cannot transition partner from "${currentStatus}" to "${params.newStatus}".`
      );
    }

    // Guard: To become ACTIVE, must have verified compliance and approved status
    if (params.newStatus === "ACTIVE") {
      if (partner.reraRequired && partner.reraRegistrationId) {
        const rera = await PartnerReraRegistration.findById(partner.reraRegistrationId);
        if (!rera || (rera.status !== "OFFICIAL_SOURCE_VERIFIED" && rera.status !== "INTERNALLY_REVIEWED")) {
          throw new Error("COMPLIANCE_ERROR: Valid RERA registration review required prior to activation.");
        }
      }

      partner.activationDate = new Date();
      partner.complianceStatus = "ACTIVE";
    }

    if (params.newStatus === "SUSPENDED") {
      partner.suspensionDate = new Date();
      partner.suspensionReason = params.reason?.trim() || "Suspended by compliance admin";
    }

    if (params.newStatus === "DEACTIVATED") {
      partner.deactivationDate = new Date();
    }

    partner.status = params.newStatus;
    partner.updatedBy = params.actorId;
    partner.updatedByName = params.actorName;
    partner.version += 1;

    await partner.save();

    // Outbox notification
    if (params.newStatus === "APPROVED" || params.newStatus === "ACTIVE") {
      await CommunicationOutboxService.enqueueEvent({
        eventType: "PARTNER_APPROVED",
        aggregateType: "USER",
        aggregateId: partner._id.toString(),
        recipientType: "CUSTOMER",
        recipientEmail: partner.email,
        recipientName: partner.displayName,
        variables: {
          partnerCode: partner.partnerCode,
          partnerName: partner.displayName,
          status: params.newStatus,
        },
      });
    } else if (params.newStatus === "SUSPENDED") {
      await CommunicationOutboxService.enqueueEvent({
        eventType: "PARTNER_SUSPENDED",
        aggregateType: "USER",
        aggregateId: partner._id.toString(),
        recipientType: "CUSTOMER",
        recipientEmail: partner.email,
        recipientName: partner.displayName,
        variables: {
          partnerCode: partner.partnerCode,
          partnerName: partner.displayName,
          reason: params.reason || "Under periodic compliance review",
        },
      });
    }

    // Audit Log
    await logAuditEvent({
      actor: { id: params.actorId, role: "SUPER_ADMIN", email: params.actorEmail, name: params.actorName, isActive: true },
      action: "PARTNER_STATUS_CHANGED",
      targetPartnerId: partner._id,
      changes: [{ field: "status", from: currentStatus, to: params.newStatus }],
      reason: params.reason?.trim() || `Status updated to ${params.newStatus}`,
    });

    return partner;
  }

  /**
   * Reviews RERA registration record for a channel partner
   */
  public static async reviewReraRegistration(params: {
    partnerId: string;
    status: "INTERNALLY_REVIEWED" | "OFFICIAL_SOURCE_VERIFIED" | "ACTION_REQUIRED" | "REJECTED";
    verificationMethod: "INTERNAL_DOCUMENT_CHECK" | "OFFICIAL_GOVERNMENT_PORTAL";
    officialSourceUrl?: string;
    notes?: string;
    actorId: string;
    actorName: string;
    actorEmail: string;
  }) {
    await connectToDatabase();

    const partner = await ChannelPartner.findById(params.partnerId);
    if (!partner) {
      throw new Error("NOT_FOUND: Channel partner not found.");
    }

    let rera = await PartnerReraRegistration.findOne({ partnerId: partner._id });
    if (!rera) {
      throw new Error("NOT_FOUND: No RERA registration submitted for this partner.");
    }

    rera.status = params.status;
    rera.verificationMethod = params.verificationMethod;
    rera.officialSourceUrl = params.officialSourceUrl?.trim();
    rera.notes = params.notes?.trim();
    rera.verifiedBy = params.actorId;
    rera.verifiedByName = params.actorName;
    rera.verifiedTimestamp = new Date();
    rera.version += 1;

    await rera.save();

    await logAuditEvent({
      actor: { id: params.actorId, role: "SUPER_ADMIN", email: params.actorEmail, name: params.actorName, isActive: true },
      action: "PARTNER_COMPLIANCE_VERIFIED",
      targetPartnerId: partner._id,
      reason: `RERA registration reviewed: ${params.status} via ${params.verificationMethod}`,
    });

    return rera;
  }

  /**
   * Reviews tax profile (PAN / GST)
   */
  public static async reviewTaxProfile(params: {
    partnerId: string;
    status: "VERIFIED" | "ACTION_REQUIRED" | "REJECTED";
    rejectionReason?: string;
    actorId: string;
    actorName: string;
    actorEmail: string;
  }) {
    await connectToDatabase();

    const taxProfile = await PartnerTaxProfile.findOne({ partnerId: new Types.ObjectId(params.partnerId) });
    if (!taxProfile) {
      throw new Error("NOT_FOUND: Tax profile not found.");
    }

    taxProfile.reviewStatus = params.status;
    taxProfile.rejectionReason = params.rejectionReason?.trim();
    taxProfile.reviewedBy = params.actorId;
    taxProfile.reviewedByName = params.actorName;
    taxProfile.reviewedTimestamp = new Date();
    taxProfile.version += 1;

    await taxProfile.save();

    await logAuditEvent({
      actor: { id: params.actorId, role: "SUPER_ADMIN", email: params.actorEmail, name: params.actorName, isActive: true },
      action: "PARTNER_TAX_PROFILE_UPDATED",
      targetPartnerId: new Types.ObjectId(params.partnerId),
      reason: `Tax profile reviewed: ${params.status}`,
    });

    return taxProfile;
  }

  /**
   * Reviews bank payout profile with maker-checker controls
   */
  public static async reviewPayoutProfile(params: {
    profileId: string;
    status: "VERIFIED" | "ACTION_REQUIRED" | "REJECTED";
    rejectionReason?: string;
    actorId: string;
    actorName: string;
    actorEmail: string;
  }) {
    await connectToDatabase();

    const profile = await PartnerPayoutProfile.findById(params.profileId);
    if (!profile) {
      throw new Error("NOT_FOUND: Payout profile not found.");
    }

    // Maker-checker validation: Approver must be distinct from submitter
    if (profile.submittedBy === params.actorId) {
      throw new Error("MAKER_CHECKER_VIOLATION: Staff member who submitted bank details cannot independently approve them.");
    }

    profile.verificationStatus = params.status;
    profile.rejectionReason = params.rejectionReason?.trim();
    profile.verifiedBy = params.actorId;
    profile.verifiedByName = params.actorName;
    profile.verifiedTimestamp = new Date();
    profile.isCurrentActive = params.status === "VERIFIED";
    profile.version += 1;

    await profile.save();

    await logAuditEvent({
      actor: { id: params.actorId, role: "SUPER_ADMIN", email: params.actorEmail, name: params.actorName, isActive: true },
      action: "PARTNER_PAYOUT_PROFILE_UPDATED",
      targetPartnerId: profile.partnerId,
      reason: `Payout profile reviewed: ${params.status} by ${params.actorName}`,
    });

    return profile;
  }
}
