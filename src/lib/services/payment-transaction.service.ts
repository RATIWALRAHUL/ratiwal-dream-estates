import "server-only";
import crypto from "crypto";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { PaymentTransaction } from "@/models/PaymentTransaction";
import { PaymentPlan } from "@/models/PaymentPlan";
import { PaymentInstallment } from "@/models/PaymentInstallment";
import { Booking } from "@/models/Booking";
import { PaymentProviderFactory } from "@/lib/payments/factory";
import { PaymentAllocationService } from "@/lib/services/payment-allocation.service";
import { PaymentReceiptService } from "@/lib/services/payment-receipt.service";
import { CommunicationOutboxService } from "@/lib/services/communication-outbox.service";
import { MoneyUtils } from "@/lib/utils/money";
import { logAuditEvent } from "@/lib/services/audit.service";
import { AdminSession } from "@/lib/auth/session";
import {
  BookingPaymentSummary,
  PaymentOverviewMetrics,
  PaymentTransactionStatus,
  PaymentMethod,
} from "@/types/payment";

export interface CreatePaymentOrderInput {
  bookingId: string;
  installmentId?: string;
  amountPaise?: number; // Optional custom amount (cannot exceed outstanding)
  notes?: Record<string, string>;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

export interface VerifyCheckoutReturnInput {
  paymentNumber: string;
  providerOrderId: string;
  providerPaymentId: string;
  providerSignature: string;
}

export class PaymentTransactionService {
  /**
   * Generates next sequential internal payment number (e.g. RDE-TXN-000123)
   */
  public static async generatePaymentNumber(): Promise<string> {
    await connectToDatabase();
    const count = await PaymentTransaction.countDocuments();
    const sequence = (count + 1).toString().padStart(6, "0");
    return `RDE-TXN-${sequence}`;
  }

  /**
   * Creates an online payment attempt and provider order with server-calculated amount
   */
  public static async createPaymentOrder(
    input: CreatePaymentOrderInput,
    session?: AdminSession
  ) {
    await connectToDatabase();

    const booking = await Booking.findById(input.bookingId);
    if (!booking) {
      throw new Error("NOT_FOUND: Linked booking not found.");
    }

    if (booking.status === "CANCELLED") {
      throw new Error("INVALID_STATE: Cannot create payment orders for cancelled bookings.");
    }

    const activePlan = await PaymentPlan.findOne({
      bookingId: booking._id,
      status: "ACTIVE",
    });

    if (!activePlan) {
      throw new Error("INVALID_STATE: Booking does not have an active payment plan.");
    }

    // Determine target amount server-side
    let payablePaise: number;
    let targetInstallment = null;

    if (input.installmentId) {
      targetInstallment = await PaymentInstallment.findById(input.installmentId);
      if (!targetInstallment || targetInstallment.planId.toString() !== activePlan._id.toString()) {
        throw new Error("NOT_FOUND: Specified instalment does not belong to active payment plan.");
      }

      if (targetInstallment.status === "PAID") {
        throw new Error("INVALID_STATE: Instalment is already fully paid.");
      }

      payablePaise = targetInstallment.outstandingAmountPaise;
      if (input.amountPaise && input.amountPaise > 0) {
        if (input.amountPaise > targetInstallment.outstandingAmountPaise) {
          throw new Error("VALIDATION_ERROR: Custom payment amount cannot exceed instalment outstanding balance.");
        }
        payablePaise = input.amountPaise;
      }
    } else {
      // Calculate overall booking outstanding balance
      const allInstalments = await PaymentInstallment.find({
        planId: activePlan._id,
        status: { $ne: "PAID" },
      }).sort({ sequence: 1 });

      const firstUnpaid = allInstalments[0];
      if (!firstUnpaid) {
        throw new Error("INVALID_STATE: All scheduled instalments on this plan are already fully paid.");
      }

      payablePaise = input.amountPaise && input.amountPaise > 0
        ? input.amountPaise
        : firstUnpaid.outstandingAmountPaise;
      targetInstallment = firstUnpaid;
    }

    MoneyUtils.assertValidMinorUnit(payablePaise, "Payable amount");

    const paymentNumber = await this.generatePaymentNumber();
    const idempotencyKey = `pay_${paymentNumber}_${crypto.randomBytes(6).toString("hex")}`;

    const adapter = PaymentProviderFactory.getAdapter();

    const providerOrder = await adapter.createOrder({
      amountPaise: payablePaise,
      currency: activePlan.currency || "INR",
      receiptId: paymentNumber,
      notes: input.notes,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
    });

    const payment = await PaymentTransaction.create({
      paymentNumber,
      bookingId: booking._id,
      planId: activePlan._id,
      installmentId: targetInstallment?._id,
      partyId: activePlan.partyId,
      currency: activePlan.currency || "INR",
      amountPaise: payablePaise,
      method: "UPI",
      source: "ONLINE_GATEWAY",
      provider: adapter.providerName,
      providerMode: adapter.providerMode,
      providerOrderId: providerOrder.providerOrderId,
      status: "CREATED",
      capturedAmountPaise: 0,
      allocatedAmountPaise: 0,
      refundedAmountPaise: 0,
      idempotencyKey,
      attemptNumber: 1,
    });

    if (session) {
      await logAuditEvent({
        actor: session.user,
        action: "PAYMENT_ORDER_CREATED",
        targetPaymentId: payment._id,
        targetPropertyId: booking.propertyId,
        targetUnitId: booking.unitId,
        reason: `Created online payment order ${paymentNumber} for ${MoneyUtils.format(payablePaise)}.`,
      });
    }

    return {
      payment,
      checkoutConfig: {
        key: providerOrder.checkoutKeyId,
        orderId: providerOrder.providerOrderId,
        amount: providerOrder.amountPaise,
        currency: providerOrder.currency,
        name: "Ratiwal Dream Estates",
        description: `Payment for Booking ${booking.bookingNumber}`,
      },
    };
  }

  /**
   * Verifies checkout return signature and marks payment as CAPTURED
   */
  public static async processCheckoutReturn(input: VerifyCheckoutReturnInput) {
    await connectToDatabase();

    const payment = await PaymentTransaction.findOne({
      paymentNumber: input.paymentNumber,
      providerOrderId: input.providerOrderId,
    });

    if (!payment) {
      throw new Error("NOT_FOUND: Matching payment attempt not found.");
    }

    if (payment.status === "CAPTURED") {
      return { success: true, payment, alreadyProcessed: true };
    }

    const adapter = PaymentProviderFactory.getAdapter(payment.provider as any);
    const isValidSignature = adapter.verifyCheckoutSignature({
      providerOrderId: input.providerOrderId,
      providerPaymentId: input.providerPaymentId,
      providerSignature: input.providerSignature,
    });

    if (!isValidSignature) {
      payment.status = "FAILED";
      payment.failureCategory = "SIGNATURE_VERIFICATION_FAILED";
      payment.sanitizedFailureMessage = "Checkout signature validation failed.";
      payment.failedAt = new Date();
      await payment.save();

      throw new Error("SECURITY_ERROR: Payment checkout signature is invalid.");
    }

    // Capture payment and record verified details
    payment.status = "CAPTURED";
    payment.providerPaymentId = input.providerPaymentId;
    payment.providerSignature = input.providerSignature;
    payment.signatureVerified = true;
    payment.capturedAmountPaise = payment.amountPaise;
    payment.capturedAt = new Date();
    payment.paidAt = new Date();
    await payment.save();

    // Allocate funds across instalments
    await PaymentAllocationService.allocateCapturedPayment({
      payment,
      planId: payment.planId,
      actorId: "SYSTEM",
      actorName: "Online Gateway Capture",
    });

    // Issue receipt
    const receipt = await PaymentReceiptService.issueReceipt({
      paymentId: payment._id,
      actorId: "SYSTEM",
      actorName: "Online Gateway Capture",
    });

    // Send transactional notification
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

    return { success: true, payment, receipt };
  }

  /**
   * Calculates real-time comprehensive financial summary for a booking
   */
  public static async getBookingPaymentSummary(bookingId: string): Promise<BookingPaymentSummary> {
    await connectToDatabase();

    const activePlan = await PaymentPlan.findOne({
      bookingId: new Types.ObjectId(bookingId),
      status: "ACTIVE",
    }).lean();

    if (!activePlan) {
      return {
        totalPlanAmountPaise: 0,
        totalPaidAmountPaise: 0,
        totalOutstandingAmountPaise: 0,
        totalOverdueAmountPaise: 0,
        totalRefundedAmountPaise: 0,
        totalPendingRefundPaise: 0,
        totalUnallocatedPaise: 0,
        currency: "INR",
        isFullyPaid: false,
        hasOverdue: false,
      };
    }

    const installments = await PaymentInstallment.find({ planId: activePlan._id }).lean();
    const payments = await PaymentTransaction.find({
      bookingId: new Types.ObjectId(bookingId),
      status: "CAPTURED",
    }).lean();

    let totalPaidPaise = 0;
    let totalOutstandingPaise = 0;
    let totalOverduePaise = 0;
    let totalRefundedPaise = 0;
    let totalUnallocatedPaise = 0;

    const now = new Date();
    let nextDueDate: Date | undefined;
    let nextDueAmount: number | undefined;

    for (const inst of installments) {
      totalPaidPaise = MoneyUtils.add(totalPaidPaise, inst.paidAmountPaise);
      totalOutstandingPaise = MoneyUtils.add(totalOutstandingPaise, inst.outstandingAmountPaise);
      totalRefundedPaise = MoneyUtils.add(totalRefundedPaise, inst.refundedAmountPaise);

      if (inst.status !== "PAID" && inst.status !== "WAIVED" && inst.status !== "CANCELLED") {
        if (new Date(inst.dueDate) < now) {
          totalOverduePaise = MoneyUtils.add(totalOverduePaise, inst.outstandingAmountPaise);
        }
        if (!nextDueDate || new Date(inst.dueDate) < nextDueDate) {
          nextDueDate = new Date(inst.dueDate);
          nextDueAmount = inst.outstandingAmountPaise;
        }
      }
    }

    for (const p of payments) {
      const unalloc = MoneyUtils.subtract(p.capturedAmountPaise, p.allocatedAmountPaise);
      totalUnallocatedPaise = MoneyUtils.add(totalUnallocatedPaise, unalloc);
    }

    return {
      totalPlanAmountPaise: activePlan.totalConsiderationPaise,
      totalPaidAmountPaise: totalPaidPaise,
      totalOutstandingAmountPaise: totalOutstandingPaise,
      totalOverdueAmountPaise: totalOverduePaise,
      totalRefundedAmountPaise: totalRefundedPaise,
      totalPendingRefundPaise: 0,
      totalUnallocatedPaise: totalUnallocatedPaise,
      currency: activePlan.currency || "INR",
      nextInstallmentDueDate: nextDueDate,
      nextInstallmentAmountPaise: nextDueAmount,
      paymentPlanStatus: activePlan.status,
      isFullyPaid: totalOutstandingPaise === 0 && activePlan.totalConsiderationPaise > 0,
      hasOverdue: totalOverduePaise > 0,
    };
  }

  /**
   * Retrieves high-level dashboard metrics
   */
  public static async getOverviewMetrics(): Promise<PaymentOverviewMetrics> {
    await connectToDatabase();

    const [capturedStats, planStats, manualPendingCount] = await Promise.all([
      PaymentTransaction.aggregate([
        {
          $group: {
            _id: "$status",
            totalCaptured: { $sum: "$capturedAmountPaise" },
            totalRefunded: { $sum: "$refundedAmountPaise" },
            count: { $sum: 1 },
          },
        },
      ]),
      PaymentInstallment.aggregate([
        {
          $group: {
            _id: "$status",
            totalDue: { $sum: "$outstandingAmountPaise" },
            count: { $sum: 1 },
          },
        },
      ]),
      connectToDatabase().then(async () => {
        const { ManualPaymentSubmission } = await import("@/models/ManualPaymentSubmission");
        return ManualPaymentSubmission.countDocuments({ status: { $in: ["SUBMITTED", "UNDER_REVIEW"] } });
      }),
    ]);

    let totalCollected = 0;
    let totalRefunded = 0;
    let totalDue = 0;
    let totalOverdue = 0;

    for (const s of capturedStats) {
      if (s._id === "CAPTURED" || s._id === "PARTIALLY_REFUNDED") {
        totalCollected = MoneyUtils.add(totalCollected, s.totalCaptured || 0);
        totalRefunded = MoneyUtils.add(totalRefunded, s.totalRefunded || 0);
      }
    }

    for (const p of planStats) {
      if (p._id === "DUE" || p._id === "UPCOMING" || p._id === "PARTIALLY_PAID") {
        totalDue = MoneyUtils.add(totalDue, p.totalDue || 0);
      }
      if (p._id === "OVERDUE") {
        totalOverdue = MoneyUtils.add(totalOverdue, p.totalDue || 0);
      }
    }

    const activePlanCount = await PaymentPlan.countDocuments({ status: "ACTIVE" });
    const recentTxnCount = await PaymentTransaction.countDocuments();

    return {
      totalCollectedPaise: totalCollected,
      totalDuePaise: totalDue,
      totalOverduePaise: totalOverdue,
      totalRefundedPaise: totalRefunded,
      pendingManualReviewCount: manualPendingCount,
      activePlanCount,
      recentTransactionsCount: recentTxnCount,
      openDisputesCount: 0,
      reconciliationIssuesCount: 0,
      currency: "INR",
    };
  }
}
