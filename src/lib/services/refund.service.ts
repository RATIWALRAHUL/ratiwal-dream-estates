import "server-only";
import crypto from "crypto";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { RefundRequest, IRefundRequest } from "@/models/RefundRequest";
import { PaymentRefund, IPaymentRefund } from "@/models/PaymentRefund";
import { PaymentTransaction, IPaymentTransaction } from "@/models/PaymentTransaction";
import { PaymentProviderFactory } from "@/lib/payments/factory";
import { PaymentAllocationService } from "@/lib/services/payment-allocation.service";
import { CommunicationOutboxService } from "@/lib/services/communication-outbox.service";
import { MoneyUtils } from "@/lib/utils/money";
import { logAuditEvent } from "@/lib/services/audit.service";
import { AdminSession } from "@/lib/auth/session";
import { RefundReasonCode } from "@/types/payment";

export interface CreateRefundRequestInput {
  paymentId: string;
  requestedAmountPaise: number;
  reasonCode: RefundReasonCode;
  explanation: string;
  supportingEvidenceKeys?: string[];
}

export class RefundService {
  /**
   * Generates next sequential refund request number (e.g. RDE-RRQ-000123)
   */
  public static async generateRequestNumber(): Promise<string> {
    await connectToDatabase();
    const count = await RefundRequest.countDocuments();
    const sequence = (count + 1).toString().padStart(6, "0");
    return `RDE-RRQ-${sequence}`;
  }

  /**
   * Generates next sequential refund execution number (e.g. RDE-RFD-000123)
   */
  public static async generateRefundNumber(): Promise<string> {
    await connectToDatabase();
    const count = await PaymentRefund.countDocuments();
    const sequence = (count + 1).toString().padStart(6, "0");
    return `RDE-RFD-${sequence}`;
  }

  /**
   * Calculates real-time refundable balance on a captured payment
   */
  public static async getRefundableBalance(paymentId: string | Types.ObjectId): Promise<{
    capturedPaise: number;
    alreadyRefundedPaise: number;
    pendingRefundsPaise: number;
    availableRefundablePaise: number;
  }> {
    await connectToDatabase();

    const payment = await PaymentTransaction.findById(paymentId);
    if (!payment || payment.status !== "CAPTURED" && payment.status !== "PARTIALLY_REFUNDED") {
      return {
        capturedPaise: 0,
        alreadyRefundedPaise: 0,
        pendingRefundsPaise: 0,
        availableRefundablePaise: 0,
      };
    }

    const pendingRequests = await RefundRequest.find({
      paymentId: payment._id,
      status: { $in: ["SUBMITTED", "UNDER_REVIEW", "APPROVED", "PROCESSING"] },
    });

    let pendingPaise = 0;
    for (const req of pendingRequests) {
      pendingPaise = MoneyUtils.add(pendingPaise, req.requestedAmountPaise);
    }

    const unrefundedPaise = MoneyUtils.subtract(
      payment.capturedAmountPaise,
      payment.refundedAmountPaise
    );

    const availableRefundablePaise = Math.max(0, unrefundedPaise - pendingPaise);

    return {
      capturedPaise: payment.capturedAmountPaise,
      alreadyRefundedPaise: payment.refundedAmountPaise,
      pendingRefundsPaise: pendingPaise,
      availableRefundablePaise,
    };
  }

  /**
   * Creates a formal refund request
   */
  public static async createRefundRequest(
    input: CreateRefundRequestInput,
    session: AdminSession
  ): Promise<IRefundRequest> {
    await connectToDatabase();

    const payment = await PaymentTransaction.findById(input.paymentId);
    if (!payment) throw new Error("NOT_FOUND: Payment transaction not found.");

    if (payment.status !== "CAPTURED" && payment.status !== "PARTIALLY_REFUNDED") {
      throw new Error(`INVALID_STATE: Only captured payments can be refunded (current: ${payment.status}).`);
    }

    MoneyUtils.assertValidMinorUnit(input.requestedAmountPaise, "Requested refund amount");

    const balances = await this.getRefundableBalance(payment._id);
    if (input.requestedAmountPaise > balances.availableRefundablePaise) {
      throw new Error(
        `EXCEEDS_REFUNDABLE_BALANCE: Requested amount (${MoneyUtils.format(input.requestedAmountPaise)}) exceeds available refundable balance (${MoneyUtils.format(balances.availableRefundablePaise)}).`
      );
    }

    const requestNumber = await this.generateRequestNumber();
    const idempotencyKey = `rrq_${requestNumber}_${crypto.randomBytes(4).toString("hex")}`;

    const refundReq = await RefundRequest.create({
      requestNumber,
      bookingId: payment.bookingId,
      paymentId: payment._id,
      partyId: payment.partyId,
      currency: payment.currency || "INR",
      requestedAmountPaise: input.requestedAmountPaise,
      reasonCode: input.reasonCode,
      explanation: input.explanation.trim(),
      supportingEvidenceKeys: input.supportingEvidenceKeys || [],
      status: "SUBMITTED",
      requestedBy: session.user.id,
      requestedByName: session.user.name,
      idempotencyKey,
    });

    await logAuditEvent({
      actor: session.user,
      action: "REFUND_REQUESTED",
      targetRefundRequestId: refundReq._id,
      targetPaymentId: payment._id,
      reason: `Submitted Refund Request ${requestNumber} for ${MoneyUtils.format(input.requestedAmountPaise)}. Reason: ${input.reasonCode}`,
    });

    await CommunicationOutboxService.enqueueEvent({
      eventType: "REFUND_REQUESTED_INTERNAL",
      aggregateType: "PAYMENT",
      aggregateId: refundReq._id,
      aggregateVersion: 1,
      recipientType: "ADMIN_POOL",
      variables: {
        requestNumber,
        amountFormatted: MoneyUtils.format(refundReq.requestedAmountPaise, refundReq.currency),
        reasonCode: refundReq.reasonCode,
      },
    }).catch(() => null);

    return refundReq;
  }

  /**
   * Approves and immediately triggers refund processing
   */
  public static async approveAndExecuteRefund(params: {
    requestId: string;
    session: AdminSession;
  }): Promise<{ refundRequest: IRefundRequest; refundExecution: IPaymentRefund }> {
    await connectToDatabase();

    const refundReq = await RefundRequest.findById(params.requestId);
    if (!refundReq) throw new Error("NOT_FOUND: Refund request not found.");

    if (refundReq.status !== "SUBMITTED" && refundReq.status !== "UNDER_REVIEW") {
      throw new Error(`INVALID_STATE: Cannot approve refund request in status "${refundReq.status}".`);
    }

    const payment = await PaymentTransaction.findById(refundReq.paymentId);
    if (!payment) throw new Error("NOT_FOUND: Payment transaction not found.");

    refundReq.status = "APPROVED";
    refundReq.approvedBy = params.session.user.id;
    refundReq.approvedByName = params.session.user.name;
    refundReq.approvedAt = new Date();
    await refundReq.save();

    // Create execution record
    const refundNumber = await this.generateRefundNumber();
    const providerIdempotencyKey = `rfd_${refundNumber}_${crypto.randomBytes(4).toString("hex")}`;

    const adapter = PaymentProviderFactory.getAdapter(payment.provider as any);

    let providerResult;
    try {
      providerResult = await adapter.createRefund({
        providerPaymentId: payment.providerPaymentId || `sim_${payment.paymentNumber}`,
        amountPaise: refundReq.requestedAmountPaise,
        reason: refundReq.reasonCode,
        idempotencyKey: providerIdempotencyKey,
      });
    } catch (err) {
      refundReq.status = "FAILED";
      await refundReq.save();

      await CommunicationOutboxService.enqueueEvent({
        eventType: "REFUND_FAILED_INTERNAL",
        aggregateType: "PAYMENT",
        aggregateId: refundReq._id,
        aggregateVersion: 1,
        recipientType: "ADMIN_POOL",
        variables: {
          requestNumber: refundReq.requestNumber,
          error: (err as Error).message,
        },
      }).catch(() => null);

      throw err;
    }

    const refundExecution = await PaymentRefund.create({
      refundNumber,
      requestId: refundReq._id,
      paymentId: payment._id,
      bookingId: payment.bookingId,
      provider: adapter.providerName,
      providerRefundId: providerResult.providerRefundId,
      providerStatus: providerResult.status,
      providerIdempotencyKey,
      currency: refundReq.currency,
      requestedAmountPaise: refundReq.requestedAmountPaise,
      processedAmountPaise: providerResult.amountPaise,
      status: providerResult.status === "processed" ? "PROCESSED" : "PROCESSING",
      processedAt: providerResult.status === "processed" ? new Date() : undefined,
      initiatedBy: params.session.user.id,
      initiatedByName: params.session.user.name,
    });

    refundReq.status = providerResult.status === "processed" ? "COMPLETED" : "PROCESSING";
    refundReq.resultingRefundId = refundExecution._id;
    await refundReq.save();

    // Update payment refunded amount
    payment.refundedAmountPaise = MoneyUtils.add(
      payment.refundedAmountPaise,
      refundExecution.processedAmountPaise
    );
    if (payment.refundedAmountPaise >= payment.capturedAmountPaise) {
      payment.status = "REFUNDED";
    } else {
      payment.status = "PARTIALLY_REFUNDED";
    }
    await payment.save();

    // Reverse financial allocations
    await PaymentAllocationService.reverseAllocationsForRefund({
      paymentId: payment._id,
      refundAmountPaise: refundExecution.processedAmountPaise,
      reason: `Refund ${refundExecution.refundNumber} for Request ${refundReq.requestNumber}`,
      session: params.session,
    });

    await logAuditEvent({
      actor: params.session.user,
      action: "REFUND_PROCESSED",
      targetRefundId: refundExecution._id,
      targetPaymentId: payment._id,
      reason: `Executed Refund ${refundExecution.refundNumber} for ${MoneyUtils.format(refundExecution.processedAmountPaise)}.`,
    });

    // Notify customer
    await CommunicationOutboxService.enqueueEvent({
      eventType: "REFUND_PROCESSED_CUSTOMER",
      aggregateType: "PAYMENT",
      aggregateId: refundExecution._id,
      aggregateVersion: 1,
      recipientType: "CUSTOMER",
      variables: {
        refundNumber: refundExecution.refundNumber,
        amountFormatted: MoneyUtils.format(refundExecution.processedAmountPaise, refundExecution.currency),
      },
    }).catch(() => null);

    return { refundRequest: refundReq, refundExecution };
  }
}
