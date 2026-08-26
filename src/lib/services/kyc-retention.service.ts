import "server-only";
import { connectToDatabase } from "@/lib/db/mongoose";
import { CustomerKycCase } from "@/models/CustomerKycCase";
import { KycDocument } from "@/models/KycDocument";
import { KycDocumentVersion } from "@/models/KycDocumentVersion";
import { KycRetentionPolicy, IKycRetentionPolicy } from "@/models/KycRetentionPolicy";
import { logAuditEvent } from "@/lib/services/audit.service";
import { AdminSession } from "@/lib/auth/session";
import { RetentionCategory, RETENTION_CATEGORIES } from "@/types/kyc";

export interface RetentionPolicyDef {
  category: RetentionCategory;
  displayName: string;
  retentionPeriodDays: number;
  statutoryReference: string;
  autoDisposalEnabled: boolean;
  legalHoldActive: boolean;
}

export const DEFAULT_RETENTION_POLICIES: RetentionPolicyDef[] = [
  {
    category: "KYC_TRANSACTIONAL_BUYER",
    displayName: "Transactional Buyer Records (Statutory Tax & Conveyance Period)",
    retentionPeriodDays: 2920, // ~8 years
    statutoryReference: "Section 12 Prevention of Money Laundering Act (PMLA) 2002 / Section 8 DPDPA 2023",
    autoDisposalEnabled: false,
    legalHoldActive: false,
  },
  {
    category: "KYC_UNCONFIRMED_PROSPECT",
    displayName: "Unconfirmed Prospect / Incomplete Leads",
    retentionPeriodDays: 180, // 6 months
    statutoryReference: "Section 8 DPDPA 2023 (Storage Limitation on Unfulfilled Purposes)",
    autoDisposalEnabled: true,
    legalHoldActive: false,
  },
  {
    category: "IDENTITY_DOCUMENT_SCAN",
    displayName: "Identity Document Upload Scans & Copies",
    retentionPeriodDays: 1825, // 5 years post transaction
    statutoryReference: "Statutory Property Registry Due Diligence Standard",
    autoDisposalEnabled: false,
    legalHoldActive: false,
  },
  {
    category: "VERIFICATION_AUDIT_LOG",
    displayName: "KYC Verification Audit Trails",
    retentionPeriodDays: 3650, // 10 years immutable audit
    statutoryReference: "Corporate Compliance & Statutory Audit Retention",
    autoDisposalEnabled: false,
    legalHoldActive: false,
  },
  {
    category: "PRIVACY_REQUEST_RECORD",
    displayName: "Data-Subject Privacy Requests & Dispositions",
    retentionPeriodDays: 1095, // 3 years
    statutoryReference: "Section 8 & Section 14 DPDPA 2023",
    autoDisposalEnabled: false,
    legalHoldActive: false,
  },
];

export class KycRetentionService {
  /**
   * Seeds default retention policies if not present
   */
  public static async seedRetentionPolicies(actorId: string = "SYSTEM"): Promise<void> {
    await connectToDatabase();

    for (const pol of DEFAULT_RETENTION_POLICIES) {
      const existing = await KycRetentionPolicy.findOne({ category: pol.category });
      if (!existing) {
        await KycRetentionPolicy.create({
          category: pol.category,
          displayName: pol.displayName,
          retentionPeriodDays: pol.retentionPeriodDays,
          statutoryReference: pol.statutoryReference,
          autoDisposalEnabled: pol.autoDisposalEnabled,
          legalHoldActive: pol.legalHoldActive,
          disposalHistory: [],
          updatedBy: actorId,
        });
      }
    }
  }

  /**
   * Executes scheduled check for expired KYC cases and documents
   */
  public static async processExpirations(session?: AdminSession) {
    await connectToDatabase();
    const now = new Date();

    // 1. Mark expired cases
    const expiredCases = await CustomerKycCase.find({
      expiresAt: { $lt: now },
      status: { $in: ["IN_PROGRESS", "SUBMITTED", "UNDER_REVIEW", "ACTION_REQUIRED", "INTERNALLY_VERIFIED", "COMPLETED"] },
    });

    let casesExpiredCount = 0;
    for (const c of expiredCases) {
      c.status = "EXPIRED";
      c.version += 1;
      await c.save();
      casesExpiredCount++;
    }

    // 2. Mark expired documents
    const expiredDocs = await KycDocument.find({
      expiryDate: { $lt: now },
      status: { $in: ["UPLOADED", "UNDER_REVIEW", "INTERNALLY_VERIFIED", "PROVIDER_VERIFIED"] },
      legalHold: false,
    });

    let docsExpiredCount = 0;
    for (const d of expiredDocs) {
      d.status = "EXPIRED";
      d.version += 1;
      await d.save();
      docsExpiredCount++;
    }

    return {
      casesExpiredCount,
      docsExpiredCount,
    };
  }

  /**
   * Toggles legal hold on a retention policy or document
   */
  public static async setLegalHold(params: {
    category: RetentionCategory;
    holdActive: boolean;
    reason: string;
    session: AdminSession;
  }) {
    await connectToDatabase();

    const policy = await KycRetentionPolicy.findOne({ category: params.category });
    if (!policy) throw new Error("NOT_FOUND: Retention policy not found.");

    policy.legalHoldActive = params.holdActive;
    policy.updatedBy = params.session.user.id;
    await policy.save();

    // Apply hold to all documents under this category
    await KycDocument.updateMany(
      { retentionCategory: params.category },
      { legalHold: params.holdActive }
    );

    await logAuditEvent({
      actor: params.session.user,
      action: "LEGAL_HOLD_APPLIED",
      reason: `${params.holdActive ? "Applied" : "Lifted"} legal hold on category ${params.category}. Reason: ${params.reason}`,
    });

    return policy;
  }
}
