import "server-only";
import crypto from "crypto";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { ManualPaymentSubmission, IManualPaymentSubmission } from "@/models/ManualPaymentSubmission";
import { PaymentTransaction } from "@/models/PaymentTransaction";
import { PaymentPlan } from "@/models/PaymentPlan";
import { Booking } from "@/models/Booking";
import { PaymentAllocationService } from "@/lib/services/payment-allocation.service";
import { PaymentReceiptService } from "@/lib/services/payment-receipt.service";
import { CommunicationOutboxService } from "@/lib/services/communication-outbox.service";
import { MoneyUtils } from "@/lib/utils/money";
import { logAuditEvent } from "@/lib/services/audit.service";
import { AdminSession } from "@/lib/auth/session";
import { PaymentMethod, ManualPaymentStatus } from "@/types/payment";

export interface SubmitManualPaymentInput {
  bookingId: string;
  installmentId?: string;
  claimedAmountPaise: number;
  method: PaymentMethod;
  referenceNumber: string;
  paymentDate: Date | string;
  bankName?: string;
  bankBranch?: string;
  drawerName?: string;
  proofDocumentKey?: string;
  proofDocumentUrl?: string;
}

export class ManualPaymentService {
  /**
   * Generates next sequential submission number (e.g. RDE-MPS-000123)
   */
  public static async generateSubmissionNumber(): Promise<string> {
    await connectToDatabase();
    const count = await ManualPaymentSubmission.countDocuments();
    const sequence = (count + 1).toString().padStart(6, "0");
    return `RDE-MPS-${sequence}`;
  }

  /**
   * Submits an offline manual payment claim
   */
  public static async submitManualPayment(
    input: SubmitManualPaymentInput,
    session: AdminSession
  ): Promise<IManualPaymentSubmission> {
    await connectToDatabase();

    const booking = await Booking.findById(input.bookingId);
    if (!booking) throw new Error("NOT_FOUND: Booking not found.");

    const activePlan = await PaymentPlan.findOne({
      bookingId: booking._id,
      status: "ACTIVE",
    });
    if (!activePlan) throw new Error("INVALID_STATE: Booking has no active payment plan.");

    MoneyUtils.assertValidMinorUnit(input.claimedAmountPaise, "Claimed amount");

    // Check for duplicate reference number
    const duplicate = await ManualPaymentSubmission.findOne({
      referenceNumber: input.referenceNumber.trim().toUpperCase(),
      status: { $in: ["SUBMITTED", "UNDER_REVIEW", "VERIFIED"] },
    });

    if (duplicate) {
      throw new Error(
        `DUPLICATE_REFERENCE: An offline payment with reference number "${input.referenceNumber}" is already registered (Submission: ${duplicate.submissionNumber}).`
      );
    }

    const submissionNumber = await this.generateSubmissionNumber();

    const submission = await ManualPaymentSubmission.create({
      submissionNumber,
      bookingId: booking._id,
      planId: activePlan._id,
      installmentId: input.installmentId ? new Types.ObjectId(input.installmentId) : undefined,
      partyId: activePlan.partyId,
      currency: activePlan.currency || "INR",
      claimedAmountPaise: input.claimedAmountPaise,
      method: input.method,
      referenceNumber: input.referenceNumber.trim().toUpperCase(),
      paymentDate: new Date(input.paymentDate),
      bankName: input.bankName?.trim(),
      bankBranch: input.bankBranch?.trim(),
      drawerName: input.drawerName?.trim(),
      proofDocumentKey: input.proofDocumentKey,
      proofDocumentUrl: input.proofDocumentUrl,
      status: "SUBMITTED",
      submittedBy: session.user.id,
      submittedByName: session.user.name,
    });

    await logAuditEvent({
      actor: session.user,
      action: "MANUAL_PAYMENT_SUBMITTED",
      targetPropertyId: booking.propertyId,
      targetUnitId: booking.unitId,
      reason: `Submitted offline payment claim ${submissionNumber} for ${MoneyUtils.format(input.claimedAmountPaise)} via ${input.method}.`,
    });

    // Alert internal finance team
    await CommunicationOutboxService.enqueueEvent({
      eventType: "MANUAL_PAYMENT_SUBMITTED_INTERNAL",
      aggregateType: "PAYMENT",
      aggregateId: submission._id,
      aggregateVersion: 1,
      recipientType: "ADMIN_POOL",
      variables: {
        submissionNumber,
        amountFormatted: MoneyUtils.format(submission.claimedAmountPaise, submission.currency),
        method: submission.method,
        referenceNumber: submission.referenceNumber,
      },
    }).catch(() => null);

    return submission;
  }

  /**
   * Reviews and verifies or rejects an offline payment claim
   */
  public static async reviewManualPayment(params: {
    submissionId: string;
    decision: "VERIFY" | "REJECT" | "ACTION_REQUIRED";
    rejectionReason?: string;
    actionRequiredReason?: string;
    verificationNotes?: string;
    session: AdminSession;
  }) {
    await connectToDatabase();

    const submission = await ManualPaymentSubmission.findById(params.submissionId);
    if (!submission) throw new Error("NOT_FOUND: Manual payment submission not found.");

    if (submission.status === "VERIFIED" || submission.status === "REJECTED") {
      throw new Error(`INVALID_STATE: Submission is already finalized in status "${submission.status}".`);
    }

    if (params.decision === "VERIFY") {
      submission.status = "VERIFIED";
      submission.reviewedBy = params.session.user.id;
      submission.reviewedByName = params.session.user.name;
      submission.reviewedAt = new Date();
      submission.verificationNotes = params.verificationNotes;

      // Create PaymentTransaction in CAPTURED state
      const { PaymentTransactionService } = await import("./payment-transaction.service");
      const paymentNumber = await PaymentTransactionService.generatePaymentNumber();
      const idempotencyKey = `manual_${submission.submissionNumber}_${crypto.randomBytes(4).toString("hex")}`;

      const payment = await PaymentTransaction.create({
        paymentNumber,
        bookingId: submission.bookingId,
        planId: submission.planId,
        installmentId: submission.installmentId,
        partyId: submission.partyId,
        currency: submission.currency,
        amountPaise: submission.claimedAmountPaise,
        method: submission.method,
        source: "OFFLINE_MANUAL",
        provider: "MANUAL",
        providerMode: "live",
        status: "CAPTURED",
        capturedAmountPaise: submission.claimedAmountPaise,
        allocatedAmountPaise: 0,
        refundedAmountPaise: 0,
        idempotencyKey,
        attemptNumber: 1,
        paidAt: submission.paymentDate,
        capturedAt: new Date(),
        manualSubmissionId: submission._id,
      });

      submission.resultingPaymentId = payment._id;
      await submission.save();

      // Allocate funds
      await PaymentAllocationService.allocateCapturedPayment({
        payment,
        planId: submission.planId,
        session: params.session,
      });

      // Issue receipt
      const receipt = await PaymentReceiptService.issueReceipt({
        paymentId: payment._id,
        session: params.session,
      });

      await logAuditEvent({
        actor: params.session.user,
        action: "MANUAL_PAYMENT_VERIFIED",
        targetPaymentId: payment._id,
        targetReceiptId: receipt._id,
        reason: `Verified offline payment submission ${submission.submissionNumber}. Generated Payment ${payment.paymentNumber} and Receipt ${receipt.receiptNumber}.`,
      });

      // Notify buyer
      await CommunicationOutboxService.enqueueEvent({
        eventType: "PAYMENT_CAPTURED_CUSTOMER",
        aggregateType: "PAYMENT",
        aggregateId: payment._id,
        aggregateVersion: 1,
        recipientType: "CUSTOMER",
        variables: {
          paymentNumber: payment.paymentNumber,
          amountFormatted: MoneyUtils.format(payment.capturedAmountPaise, payment.currency),
          receiptNumber: receipt.receiptNumber,
        },
      }).catch(() => null);

      return { submission, payment, receipt };
    }

    if (params.decision === "REJECT") {
      submission.status = "REJECTED";
      submission.reviewedBy = params.session.user.id;
      submission.reviewedByName = params.session.user.name;
      submission.reviewedAt = new Date();
      submission.rejectionReason = params.rejectionReason || "Verification failed.";
      await submission.save();

      await logAuditEvent({
        actor: params.session.user,
        action: "MANUAL_PAYMENT_REJECTED",
        reason: `Rejected offline payment submission ${submission.submissionNumber}. Reason: ${submission.rejectionReason}`,
      });

      return { submission };
    }

    if (params.decision === "ACTION_REQUIRED") {
      submission.status = "ACTION_REQUIRED";
      submission.reviewedBy = params.session.user.id;
      submission.reviewedByName = params.session.user.name;
      submission.reviewedAt = new Date();
      submission.actionRequiredReason = params.actionRequiredReason || "Additional payment proof required.";
      await submission.save();

      await CommunicationOutboxService.enqueueEvent({
        eventType: "MANUAL_PAYMENT_ACTION_REQUIRED_CUSTOMER",
        aggregateType: "PAYMENT",
        aggregateId: submission._id,
        aggregateVersion: 1,
        recipientType: "CUSTOMER",
        variables: {
          submissionNumber: submission.submissionNumber,
          actionRequiredReason: submission.actionRequiredReason,
        },
      }).catch(() => null);

      return { submission };
    }

    throw new Error("INVALID_DECISION: Unrecognized review decision.");
  }
}
