import "server-only";
import { connectToDatabase } from "@/lib/db/mongoose";
import { CustomerKycCase } from "@/models/CustomerKycCase";
import { KycDocument } from "@/models/KycDocument";

import { Booking } from "@/models/Booking";
import { KycSubmissionSession } from "@/models/KycSubmissionSession";
import { logAuditEvent } from "@/lib/services/audit.service";
import { AdminSession } from "@/lib/auth/session";

export interface ReconciliationAnomaly {
  code: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  entityType: "BOOKING" | "KYC_CASE" | "DOCUMENT" | "SUBMISSION_SESSION";
  entityId: string;
  description: string;
}

export class KycReconciliationService {
  /**
   * Executes a comprehensive KYC integrity reconciliation audit
   */
  public static async runReconciliation(session: AdminSession): Promise<{
    anomalies: ReconciliationAnomaly[];
    totalScanned: number;
    auditTimestamp: Date;
  }> {
    await connectToDatabase();
    const anomalies: ReconciliationAnomaly[] = [];

    // 1. Check for Bookings that require KYC verification but lack a completed KYC Case
    const confirmedBookings = await Booking.find({ status: "CONFIRMED" }).lean();
    for (const b of confirmedBookings) {
      const kycCase = await CustomerKycCase.findOne({ bookingId: b._id });
      if (!kycCase) {
        anomalies.push({
          code: "BOOKING_WITHOUT_KYC_CASE",
          severity: "HIGH",
          entityType: "BOOKING",
          entityId: b._id.toString(),
          description: `Confirmed booking ${b.bookingNumber} has no associated Customer KYC Case.`,
        });
      } else if (kycCase.status !== "COMPLETED") {
        anomalies.push({
          code: "BOOKING_CONFIRMED_KYC_INCOMPLETE",
          severity: "CRITICAL",
          entityType: "BOOKING",
          entityId: b._id.toString(),
          description: `Booking ${b.bookingNumber} is marked CONFIRMED, but KYC Case ${kycCase.kycCaseNumber} is in status ${kycCase.status}.`,
        });
      }
    }

    // 2. Check for Verified status on expired documents
    const now = new Date();
    const verifiedExpiredDocs = await KycDocument.find({
      status: { $in: ["INTERNALLY_VERIFIED", "PROVIDER_VERIFIED"] },
      expiryDate: { $lt: now },
    }).lean();

    for (const doc of verifiedExpiredDocs) {
      anomalies.push({
        code: "VERIFIED_EXPIRED_DOCUMENT",
        severity: "HIGH",
        entityType: "DOCUMENT",
        entityId: doc._id.toString(),
        description: `Document ${doc.requirementKey} is marked verified but expired on ${doc.expiryDate?.toISOString().slice(0, 10)}.`,
      });
    }

    // 3. Check for uploaded versions without review
    const uploadedDocs = await KycDocument.find({
      status: "UPLOADED",
      updatedAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Uploaded > 7 days ago
    }).lean();

    for (const doc of uploadedDocs) {
      anomalies.push({
        code: "DOCUMENT_REVIEW_STALLED",
        severity: "MEDIUM",
        entityType: "DOCUMENT",
        entityId: doc._id.toString(),
        description: `Document ${doc.requirementKey} has been awaiting review for over 7 days.`,
      });
    }

    // 4. Check for orphaned active submission sessions that are past expiration
    const orphanedSessions = await KycSubmissionSession.find({
      status: "ACTIVE",
      expiresAt: { $lt: now },
    }).lean();

    for (const s of orphanedSessions) {
      anomalies.push({
        code: "ORPHANED_EXPIRED_SESSION",
        severity: "LOW",
        entityType: "SUBMISSION_SESSION",
        entityId: s._id.toString(),
        description: `Submission session token for applicant ${s.applicantId} is expired but still marked ACTIVE.`,
      });
    }

    await logAuditEvent({
      actor: session.user,
      action: "KYC_RECONCILIATION_RUN",
      reason: `Executed KYC reconciliation scan. Discovered ${anomalies.length} potential anomalies.`,
    });

    return {
      anomalies,
      totalScanned: confirmedBookings.length + verifiedExpiredDocs.length + uploadedDocs.length,
      auditTimestamp: new Date(),
    };
  }
}
