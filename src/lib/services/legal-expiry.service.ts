import "server-only";

import { connectToDatabase } from "@/lib/db/mongoose";
import { LegalDocument } from "@/models/LegalDocument";
import { LegalDocumentReview } from "@/models/LegalDocumentReview";

import { LegalChecklistService } from "./legal-checklist.service";
import { logger } from "@/lib/logger";

export class LegalExpiryService {
  /**
   * Evaluates expired documents across database and idempotently transitions them to EXPIRED
   */
  static async evaluateExpiringDocuments(): Promise<{
    expiredCount: number;
    expiring30DaysCount: number;
    reviewDueCount: number;
  }> {
    await connectToDatabase();
    const now = new Date();
    const in30Days = new Date(Date.now() + 30 * 86400000);

    // 1. Find internally verified documents whose expiryDate has passed
    const expiredDocs = await LegalDocument.find({
      status: "INTERNALLY_VERIFIED",
      expiryDate: { $lte: now },
      archivedAt: { $exists: false },
    });

    let expiredCount = 0;
    for (const doc of expiredDocs) {
      doc.status = "EXPIRED";
      doc.version += 1;
      await doc.save();

      // Append to review ledger
      await LegalDocumentReview.create({
        legalDocumentId: doc._id,
        documentVersionId: doc.currentVersionId,
        documentVersionNumber: doc.currentVersionNumber,
        reviewAction: "EXPIRE",
        fromStatus: "INTERNALLY_VERIFIED",
        toStatus: "EXPIRED",
        reviewerId: "SYSTEM",
        reviewerName: "Automated Expiry Sentinel",
        reviewerRole: "SYSTEM",
        reasonCode: "STATUTORY_VALIDITY_EXPIRED",
        sanitizedNote: `Document statutory validity expired on ${doc.expiryDate?.toISOString().slice(0, 10)}. Re-verification required.`,
      });

      // Update property checklist
      await LegalChecklistService.evaluatePropertyChecklist(doc.propertyId.toString(), "SYSTEM");
      expiredCount++;
    }

    // 2. Count documents expiring within next 30 days
    const expiring30DaysCount = await LegalDocument.countDocuments({
      status: "INTERNALLY_VERIFIED",
      expiryDate: { $gt: now, $lte: in30Days },
      archivedAt: { $exists: false },
    });

    // 3. Count documents with review due date passed or due within 7 days
    const reviewDueCount = await LegalDocument.countDocuments({
      status: { $in: ["UNDER_REVIEW", "INTERNALLY_VERIFIED"] },
      reviewDueDate: { $lte: in30Days },
      archivedAt: { $exists: false },
    });

    logger.info(`[LegalExpiry] Evaluated expired documents: ${expiredCount} expired, ${expiring30DaysCount} expiring in 30d, ${reviewDueCount} review due.`);

    return {
      expiredCount,
      expiring30DaysCount,
      reviewDueCount,
    };
  }
}
