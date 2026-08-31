import "server-only";
import { connectToDatabase } from "@/lib/db/mongoose";
import { PaymentTransaction } from "@/models/PaymentTransaction";
import { PaymentReceipt } from "@/models/PaymentReceipt";

import { ManualPaymentSubmission } from "@/models/ManualPaymentSubmission";
import { RefundRequest } from "@/models/RefundRequest";
import { logAuditEvent } from "@/lib/services/audit.service";
import { AdminSession } from "@/lib/auth/session";
import { ReconciliationSeverity } from "@/types/payment";

export interface ReconciliationAnomaly {
  code: string;
  severity: ReconciliationSeverity;
  description: string;
  entityId: string;
  entityType: "PAYMENT" | "RECEIPT" | "PLAN" | "MANUAL_SUBMISSION" | "REFUND";
  remediationAction?: string;
}

export interface ReconciliationRunResult {
  auditTimestamp: string;
  totalScanned: number;
  anomalies: ReconciliationAnomaly[];
  summary: {
    criticalCount: number;
    warningCount: number;
    infoCount: number;
  };
}

export class PaymentReconciliationService {
  /**
   * Bounded financial integrity scanner
   */
  public static async runReconciliation(session?: AdminSession): Promise<ReconciliationRunResult> {
    await connectToDatabase();

    const anomalies: ReconciliationAnomaly[] = [];
    let scannedCount = 0;

    // 1. Scan Captured Payments with Unallocated Amounts
    const capturedPayments = await PaymentTransaction.find({
      status: "CAPTURED",
    }).lean();

    scannedCount += capturedPayments.length;

    for (const p of capturedPayments) {
      if (p.capturedAmountPaise > p.allocatedAmountPaise) {
        anomalies.push({
          code: "UNALLOCATED_CAPTURED_FUNDS",
          severity: "WARNING",
          description: `Payment ${p.paymentNumber} has unallocated funds of ${p.capturedAmountPaise - p.allocatedAmountPaise} paise.`,
          entityId: p._id.toString(),
          entityType: "PAYMENT",
          remediationAction: "Run automatic FIFO allocation or manually assign to active instalment.",
        });
      }

      // 2. Scan Captured Payments missing Receipts
      const receipt = await PaymentReceipt.findOne({
        paymentId: p._id,
        receiptStatus: "ISSUED",
      });

      if (!receipt) {
        anomalies.push({
          code: "MISSING_RECEIPT_FOR_CAPTURED_PAYMENT",
          severity: "CRITICAL",
          description: `Captured Payment ${p.paymentNumber} does not have an issued receipt.`,
          entityId: p._id.toString(),
          entityType: "PAYMENT",
          remediationAction: "Issue official payment receipt.",
        });
      }
    }

    // 3. Scan Offline payments pending review > 48h
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const staleManualSubmissions = await ManualPaymentSubmission.find({
      status: "SUBMITTED",
      createdAt: { $lte: fortyEightHoursAgo },
    }).lean();

    scannedCount += staleManualSubmissions.length;

    for (const s of staleManualSubmissions) {
      anomalies.push({
        code: "STALE_MANUAL_PAYMENT_REVIEW",
        severity: "WARNING",
        description: `Offline payment submission ${s.submissionNumber} has been pending review for over 48 hours.`,
        entityId: s._id.toString(),
        entityType: "MANUAL_SUBMISSION",
        remediationAction: "Finance reviewer should verify or request corrections.",
      });
    }

    // 4. Scan Stale Refund Requests > 72h
    const seventyTwoHoursAgo = new Date(Date.now() - 72 * 60 * 60 * 1000);
    const staleRefundRequests = await RefundRequest.find({
      status: "SUBMITTED",
      createdAt: { $lte: seventyTwoHoursAgo },
    }).lean();

    scannedCount += staleRefundRequests.length;

    for (const r of staleRefundRequests) {
      anomalies.push({
        code: "STALE_REFUND_REQUEST",
        severity: "WARNING",
        description: `Refund request ${r.requestNumber} has been awaiting approval for over 72 hours.`,
        entityId: r._id.toString(),
        entityType: "REFUND",
        remediationAction: "Finance manager should review and approve or reject.",
      });
    }

    const summary = {
      criticalCount: anomalies.filter((a) => a.severity === "CRITICAL").length,
      warningCount: anomalies.filter((a) => a.severity === "WARNING").length,
      infoCount: anomalies.filter((a) => a.severity === "INFO").length,
    };

    if (session) {
      await logAuditEvent({
        actor: session.user,
        action: "PAYMENT_RECONCILIATION_RUN",
        reason: `Reconciliation audit completed. Scanned ${scannedCount} records, identified ${anomalies.length} anomalies (${summary.criticalCount} critical).`,
      });
    }

    return {
      auditTimestamp: new Date().toISOString(),
      totalScanned: scannedCount,
      anomalies,
      summary,
    };
  }
}
