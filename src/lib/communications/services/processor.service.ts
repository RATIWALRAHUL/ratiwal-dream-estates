/**
 * @file processor.service.ts
 * @description Bounded batch processor with atomic worker leasing, exponential backoff with jitter,
 * delivery recording, and dead-letter handling.
 */

import { connectToDatabase } from "@/lib/db/mongoose";
import { NotificationOutbox, INotificationOutbox } from "@/models/NotificationOutbox";
import { NotificationDelivery } from "@/models/NotificationDelivery";
import { EmailProvider } from "../providers/email.provider";
import { WhatsAppProvider } from "../providers/whatsapp.provider";
import { ConsentService } from "./consent.service";
import { TemplateRegistry } from "../templates/registry";
import { FailureCategory, NotificationChannel } from "@/types/communication";
import { Types } from "mongoose";

export interface BatchProcessingResult {
  processed: number;
  succeeded: number;
  retried: number;
  deadLettered: number;
  cancelled: number;
}

export class NotificationProcessorService {
  /**
   * Calculate exponential backoff delay with jitter (in milliseconds)
   */
  public static calculateBackoff(attempt: number): number {
    const baseMinutes = Math.min(Math.pow(2, attempt), 60); // 2m, 4m, 8m, 16m, 32m, max 60m
    const baseMs = baseMinutes * 60 * 1000;
    const jitter = (Math.random() * 0.4 - 0.2) * baseMs; // ±20% jitter
    return Math.max(30000, Math.floor(baseMs + jitter)); // Minimum 30s
  }

  /**
   * Process a bounded batch of due outbox records (Default batch size: 25)
   */
  public static async processBatch(batchSize: number = 25): Promise<BatchProcessingResult> {
    await connectToDatabase();

    const workerId = `worker_${process.pid || 1}_${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date();
    const leaseDurationMs = 60 * 1000; // 60-second worker lease
    const leaseUntil = new Date(now.getTime() + leaseDurationMs);

    const result: BatchProcessingResult = {
      processed: 0,
      succeeded: 0,
      retried: 0,
      deadLettered: 0,
      cancelled: 0,
    };

    // 1. Find IDs of eligible items
    const eligibleItems = await NotificationOutbox.find(
      {
        status: { $in: ["PENDING", "RETRY_SCHEDULED"] },
        scheduledFor: { $lte: now },
        nextAttemptAt: { $lte: now },
        $or: [{ leaseUntil: null }, { leaseUntil: { $lt: now } }],
      },
      { _id: 1 }
    )
      .sort({ priority: -1, scheduledFor: 1 })
      .limit(batchSize)
      .lean();

    for (const item of eligibleItems) {
      // 2. Atomic acquisition of lease
      const outbox = await NotificationOutbox.findOneAndUpdate(
        {
          _id: item._id,
          status: { $in: ["PENDING", "RETRY_SCHEDULED"] },
          $or: [{ leaseUntil: null }, { leaseUntil: { $lt: now } }],
        },
        {
          $set: {
            status: "PROCESSING",
            leaseOwner: workerId,
            leaseUntil,
          },
          $inc: { attemptCount: 1 },
        },
        { returnDocument: "after" }
      );

      if (!outbox) continue; // Concurrently acquired by another worker
      result.processed++;

      try {
        await this.processSingleOutbox(outbox, result);
      } catch (err) {
        console.error("[NotificationProcessor] Unexpected error processing outbox item:", outbox._id, err);
        // Reschedule on unexpected failure
        const backoffMs = this.calculateBackoff(outbox.attemptCount);
        await NotificationOutbox.updateOne(
          { _id: outbox._id },
          {
            $set: {
              status: outbox.attemptCount >= outbox.maxAttempts ? "DEAD_LETTER" : "RETRY_SCHEDULED",
              nextAttemptAt: new Date(Date.now() + backoffMs),
              lastErrorCode: "PROCESSOR_UNEXPECTED_ERROR",
              leaseUntil: null,
            },
          }
        );
      }
    }

    return result;
  }

  /**
   * Process all channels for an individual outbox record
   */
  private static async processSingleOutbox(
    outbox: INotificationOutbox,
    result: BatchProcessingResult
  ): Promise<void> {
    const rendered = TemplateRegistry.render(outbox.eventType, outbox.variables);
    const channels = outbox.channels.filter((c) => c !== "IN_APP"); // IN_APP already created on enqueue

    if (channels.length === 0) {
      await NotificationOutbox.updateOne(
        { _id: outbox._id },
        { $set: { status: "SENT", leaseUntil: null } }
      );
      result.succeeded++;
      return;
    }

    let allSucceeded = true;
    let anySucceeded = false;
    let isPermanentFailure = false;
    let lastError: string | undefined;

    for (const channel of channels) {
      const channelResult = await this.deliverChannel(outbox, channel, rendered);
      if (channelResult.success) {
        anySucceeded = true;
      } else {
        allSucceeded = false;
        lastError = channelResult.failureMessage;
        if (channelResult.isPermanent) {
          isPermanentFailure = true;
        }
      }
    }

    if (allSucceeded) {
      await NotificationOutbox.updateOne(
        { _id: outbox._id },
        { $set: { status: "SENT", leaseUntil: null, lastErrorCode: null } }
      );
      result.succeeded++;
    } else if (isPermanentFailure || outbox.attemptCount >= outbox.maxAttempts) {
      await NotificationOutbox.updateOne(
        { _id: outbox._id },
        {
          $set: {
            status: "DEAD_LETTER",
            leaseUntil: null,
            lastErrorCode: lastError || "PERMANENT_DELIVERY_FAILURE",
          },
        }
      );
      result.deadLettered++;
    } else {
      const backoffMs = this.calculateBackoff(outbox.attemptCount);
      await NotificationOutbox.updateOne(
        { _id: outbox._id },
        {
          $set: {
            status: "RETRY_SCHEDULED",
            nextAttemptAt: new Date(Date.now() + backoffMs),
            leaseUntil: null,
            lastErrorCode: lastError || "TRANSIENT_FAILURE",
          },
        }
      );
      result.retried++;
    }
  }

  /**
   * Execute delivery for a single channel attempt
   */
  private static async deliverChannel(
    outbox: INotificationOutbox,
    channel: NotificationChannel,
    rendered: ReturnType<typeof TemplateRegistry.render>
  ): Promise<{ success: boolean; isPermanent?: boolean; failureMessage?: string }> {
    const rawRecipient = channel === "EMAIL" ? outbox.recipientEmail : outbox.recipientPhone;
    const maskedRecipient =
      channel === "EMAIL"
        ? EmailProvider.maskEmail(outbox.recipientEmail || "")
        : WhatsAppProvider.maskPhone(outbox.recipientPhone || "");

    // 1. Check Consent and Suppression
    if (!rawRecipient) {
      await NotificationDelivery.create({
        outboxId: outbox._id,
        eventType: outbox.eventType,
        channel,
        provider: channel === "EMAIL" ? "RESEND" : "WHATSAPP",
        maskedRecipient: "MISSING",
        status: "FAILED",
        attempt: outbox.attemptCount,
        failedAt: new Date(),
        failureCategory: "PERMANENT_INVALID_RECIPIENT",
        failureMessage: `Missing recipient ${channel.toLowerCase()} address`,
      });
      return { success: false, isPermanent: true, failureMessage: "MISSING_RECIPIENT" };
    }

    const consentCheck = await ConsentService.isDeliveryPermitted(channel, rawRecipient);
    if (!consentCheck.permitted) {
      await NotificationDelivery.create({
        outboxId: outbox._id,
        eventType: outbox.eventType,
        channel,
        provider: channel === "EMAIL" ? "RESEND" : "WHATSAPP",
        maskedRecipient,
        status: "SUPPRESSED",
        attempt: outbox.attemptCount,
        failedAt: new Date(),
        failureCategory: "PERMANENT_MISSING_CONSENT",
        failureMessage: `Delivery suppressed: ${consentCheck.reason}`,
      });
      return { success: false, isPermanent: true, failureMessage: consentCheck.reason };
    }

    // 2. Deliver via Provider
    if (channel === "EMAIL" && rendered.email) {
      const sendResult = await EmailProvider.send({
        to: rawRecipient,
        subject: rendered.email.subject,
        html: rendered.email.html,
        text: rendered.email.text,
        idempotencyKey: outbox.idempotencyKey,
      });

      await NotificationDelivery.create({
        outboxId: outbox._id,
        eventType: outbox.eventType,
        channel: "EMAIL",
        provider: (process.env.COMMUNICATIONS_MODE === "live" && process.env.RESEND_API_KEY) ? "RESEND" : "TEST_SIMULATOR",
        providerMessageId: sendResult.providerMessageId,
        maskedRecipient,
        status: sendResult.success ? "SENT" : "FAILED",
        attempt: outbox.attemptCount,
        sentAt: sendResult.success ? new Date() : undefined,
        failedAt: !sendResult.success ? new Date() : undefined,
        providerStatusCode: sendResult.statusCode,
        failureCategory: sendResult.failureCategory,
        failureMessage: sendResult.failureMessage,
      });

      const isPermanent = sendResult.failureCategory?.startsWith("PERMANENT_");
      return { success: sendResult.success, isPermanent, failureMessage: sendResult.failureMessage };
    }

    if (channel === "WHATSAPP" && rendered.whatsapp) {
      const sendResult = await WhatsAppProvider.send({
        toPhone: rawRecipient,
        templateName: rendered.whatsapp.templateName,
        language: rendered.whatsapp.language,
        parameters: rendered.whatsapp.parameters,
        idempotencyKey: outbox.idempotencyKey,
      });

      await NotificationDelivery.create({
        outboxId: outbox._id,
        eventType: outbox.eventType,
        channel: "WHATSAPP",
        provider: (process.env.COMMUNICATIONS_MODE === "live" && process.env.WHATSAPP_ACCESS_TOKEN) ? "WHATSAPP_CLOUD" : "TEST_SIMULATOR",
        providerMessageId: sendResult.providerMessageId,
        maskedRecipient,
        status: sendResult.success ? "SENT" : "FAILED",
        attempt: outbox.attemptCount,
        sentAt: sendResult.success ? new Date() : undefined,
        failedAt: !sendResult.success ? new Date() : undefined,
        providerStatusCode: sendResult.statusCode,
        failureCategory: sendResult.failureCategory,
        failureMessage: sendResult.failureMessage,
      });

      const isPermanent = sendResult.failureCategory?.startsWith("PERMANENT_");
      return { success: sendResult.success, isPermanent, failureMessage: sendResult.failureMessage };
    }

    return { success: true };
  }
}
