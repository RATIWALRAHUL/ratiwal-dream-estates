/**
 * @file outbox.service.ts
 * @description Core Outbox enqueueing and lifecycle management.
 * Enforces strict non-blocking outbox writes for all business operations.
 */

import { connectToDatabase } from "@/lib/db/mongoose";
import { NotificationOutbox, INotificationOutbox } from "@/models/NotificationOutbox";
import { InAppNotification } from "@/models/InAppNotification";
import {
  NotificationEventType,
  NotificationChannel,
  COMMUNICATION_EVENT_DEFINITIONS,
} from "@/types/communication";
import { TemplateRegistry } from "../templates/registry";
import { Types } from "mongoose";

export interface EnqueueOutboxInput {
  eventType: NotificationEventType;
  aggregateType: "LEAD" | "SITE_VISIT" | "PROPERTY" | "USER" | "DEAL" | "BOOKING" | "KYC" | "PAYMENT";
  aggregateId: string | Types.ObjectId;
  aggregateVersion?: number;
  recipientType: "CUSTOMER" | "ADVISOR" | "ADMIN_POOL";
  recipientAdminId?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  recipientName?: string;
  channels?: NotificationChannel[];
  templateKey?: string;
  variables: Record<string, unknown>;
  priority?: "HIGH" | "NORMAL" | "LOW";
  scheduledFor?: Date;
}

export class OutboxService {
  /**
   * Deterministic Idempotency Key generator (No raw PII in key)
   */
  public static generateIdempotencyKey(
    eventType: NotificationEventType,
    aggregateId: string,
    aggregateVersion: number,
    templateKey: string
  ): string {
    return `${eventType}:${aggregateId}:v${aggregateVersion}:${templateKey}`;
  }

  /**
   * Enqueue a new communication outbox event.
   * Safe to call inside any business transaction or mutation without failing the main operation.
   */
  public static async enqueue(input: EnqueueOutboxInput): Promise<{ outboxId?: string; duplicate: boolean }> {
    try {
      await connectToDatabase();

      const eventDef = COMMUNICATION_EVENT_DEFINITIONS[input.eventType];
      const channels = input.channels || eventDef?.allowedChannels || ["IN_APP"];
      const templateKey = input.templateKey || eventDef?.templateKey || "default_template";
      const aggregateVersion = input.aggregateVersion || 1;
      const scheduledFor = input.scheduledFor || new Date();
      const priority = input.priority || eventDef?.defaultPriority || "NORMAL";

      const aggIdStr = input.aggregateId.toString();
      const idempotencyKey = this.generateIdempotencyKey(
        input.eventType,
        aggIdStr,
        aggregateVersion,
        templateKey
      );

      // Check if already enqueued
      const existing = await NotificationOutbox.findOne({ idempotencyKey }).lean();
      if (existing) {
        return { outboxId: existing._id.toString(), duplicate: true };
      }

      // If IN_APP channel is requested, persist InAppNotification immediately
      if (channels.includes("IN_APP")) {
        const rendered = TemplateRegistry.render(input.eventType, input.variables);
        if (rendered.inApp) {
          await InAppNotification.create({
            recipientAdminId: input.recipientAdminId || "ALL_ADMINS",
            eventType: input.eventType,
            title: rendered.inApp.title,
            message: rendered.inApp.message,
            entityType: input.aggregateType,
            entityId: aggIdStr,
            deepLink: rendered.inApp.deepLink,
          });
        }
      }

      // Create outbox record for external / background channels
      const outbox = await NotificationOutbox.create({
        eventType: input.eventType,
        aggregateType: input.aggregateType,
        aggregateId: new Types.ObjectId(input.aggregateId),
        aggregateVersion,
        recipientType: input.recipientType,
        recipientAdminId: input.recipientAdminId,
        recipientEmail: input.recipientEmail,
        recipientPhone: input.recipientPhone,
        recipientName: input.recipientName,
        channels,
        templateKey,
        templateVersion: 1,
        locale: "en-IN",
        variables: input.variables,
        priority,
        scheduledFor,
        status: "PENDING",
        idempotencyKey,
        attemptCount: 0,
        maxAttempts: 5,
        nextAttemptAt: scheduledFor,
      });

      return { outboxId: outbox._id.toString(), duplicate: false };
    } catch (err) {
      // Outbox failures must be logged but never throw to disrupt primary business action
      console.error("[OutboxService] Failed to enqueue event:", input.eventType, err);
      return { duplicate: false };
    }
  }

  /**
   * Cancel pending scheduled reminders for an aggregate (e.g. when site visit rescheduled/cancelled)
   */
  public static async cancelPendingReminders(
    aggregateType: "LEAD" | "SITE_VISIT",
    aggregateId: string | Types.ObjectId,
    reason: string = "SITE_VISIT_MODIFIED"
  ): Promise<number> {
    try {
      await connectToDatabase();

      const result = await NotificationOutbox.updateMany(
        {
          aggregateType,
          aggregateId: new Types.ObjectId(aggregateId),
          status: { $in: ["PENDING", "RETRY_SCHEDULED"] },
          eventType: { $in: ["SITE_VISIT_REMINDER_24H", "SITE_VISIT_REMINDER_2H"] },
        },
        {
          $set: {
            status: "CANCELLED",
            cancelledAt: new Date(),
            cancelReason: reason,
          },
        }
      );

      return result.modifiedCount;
    } catch (err) {
      console.error("[OutboxService] Failed to cancel pending reminders:", err);
      return 0;
    }
  }
}
