import "server-only";
import { connectToDatabase } from "@/lib/db/mongoose";
import { PaymentWebhookReceipt, IPaymentWebhookReceipt } from "@/models/PaymentWebhookReceipt";
import { PaymentTransaction } from "@/models/PaymentTransaction";
import { PaymentRefund } from "@/models/PaymentRefund";
import { PaymentDispute } from "@/models/PaymentDispute";
import { PaymentProviderFactory } from "@/lib/payments/factory";
import { PaymentAllocationService } from "@/lib/services/payment-allocation.service";
import { PaymentReceiptService } from "@/lib/services/payment-receipt.service";
import { CommunicationOutboxService } from "@/lib/services/communication-outbox.service";
import { MoneyUtils } from "@/lib/utils/money";

export interface ProcessWebhookInput {
  provider: "RAZORPAY" | "MOCK";
  rawBody: string | Buffer;
  signature: string;
  providerEventId: string;
  payload: any;
}

export class PaymentWebhookService {
  /**
   * Idempotently processes an incoming payment provider webhook
   */
  public static async processWebhook(input: ProcessWebhookInput) {
    await connectToDatabase();

    // Check duplicate event ID
    const existing = await PaymentWebhookReceipt.findOne({
      providerEventId: input.providerEventId,
    });

    if (existing) {
      return { success: true, duplicate: true, status: "DUPLICATE_IGNORED" };
    }

    const adapter = PaymentProviderFactory.getAdapter(input.provider);
    const isValid = adapter.verifyWebhookSignature({
      rawBody: input.rawBody,
      signature: input.signature,
      webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || "",
    });

    const retentionExpiry = new Date();
    retentionExpiry.setDate(retentionExpiry.getDate() + 30); // 30-day retention

    if (!isValid) {
      await PaymentWebhookReceipt.create({
        provider: input.provider,
        providerEventId: input.providerEventId,
        eventType: input.payload?.event || "UNKNOWN",
        signatureVerified: false,
        receivedAt: new Date(),
        status: "SIGNATURE_FAILED",
        safeErrorCode: "INVALID_SIGNATURE",
        payloadRetentionExpiresAt: retentionExpiry,
      });

      throw new Error("SECURITY_ERROR: Invalid webhook signature.");
    }

    const event = input.payload?.event;
    const eventData = input.payload?.payload;

    const receipt = (await PaymentWebhookReceipt.create({
      provider: input.provider,
      providerEventId: input.providerEventId,
      eventType: event || "UNKNOWN",
      signatureVerified: true,
      receivedAt: new Date(),
      status: "PROCESSING",
      payloadRetentionExpiresAt: retentionExpiry,
    })) as unknown as IPaymentWebhookReceipt;

    try {
      if (event === "payment.captured" || event === "order.paid") {
        const paymentEntity = eventData?.payment?.entity;
        const providerOrderId = paymentEntity?.order_id;
        const providerPaymentId = paymentEntity?.id;

        if (providerOrderId) {
          const payment = await PaymentTransaction.findOne({ providerOrderId });
          if (payment && payment.status !== "CAPTURED") {
            payment.status = "CAPTURED";
            payment.providerPaymentId = providerPaymentId;
            payment.capturedAmountPaise = paymentEntity.amount || payment.amountPaise;
            payment.capturedAt = new Date();
            payment.paidAt = new Date();
            await payment.save();

            await PaymentAllocationService.allocateCapturedPayment({
              payment,
              planId: payment.planId,
              actorId: "WEBHOOK",
              actorName: "Razorpay Webhook",
            });

            const issuedReceipt = await PaymentReceiptService.issueReceipt({
              paymentId: payment._id,
              actorId: "WEBHOOK",
              actorName: "Razorpay Webhook",
            });

            receipt.paymentId = payment._id;
          }
        }
      } else if (event === "payment.failed") {
        const paymentEntity = eventData?.payment?.entity;
        const providerOrderId = paymentEntity?.order_id;
        if (providerOrderId) {
          const payment = await PaymentTransaction.findOne({ providerOrderId });
          if (payment && payment.status === "CREATED") {
            payment.status = "FAILED";
            payment.failureCategory = paymentEntity?.error_code || "GATEWAY_ERROR";
            payment.sanitizedFailureMessage = paymentEntity?.error_description || "Payment failed.";
            payment.failedAt = new Date();
            await payment.save();
            receipt.paymentId = payment._id;
          }
        }
      } else if (event === "refund.processed") {
        const refundEntity = eventData?.refund?.entity;
        const providerRefundId = refundEntity?.id;
        if (providerRefundId) {
          const refund = await PaymentRefund.findOne({ providerRefundId });
          if (refund && refund.status !== "PROCESSED") {
            refund.status = "PROCESSED";
            refund.processedAt = new Date();
            await refund.save();
            receipt.refundId = refund._id;
          }
        }
      }

      receipt.status = "PROCESSED";
      receipt.processedAt = new Date();
      await receipt.save();

      return { success: true, receipt };
    } catch (err) {
      receipt.status = "PROCESSING_FAILED";
      receipt.safeErrorCode = (err as Error).message;
      await receipt.save();
      throw err;
    }
  }
}
