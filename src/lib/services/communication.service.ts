/**
 * @file communication.service.ts
 * @description Operational query service for Communications Dashboard metrics, delivery history,
 * template catalog, and dead-letter recovery.
 */

import { connectToDatabase } from "@/lib/db/mongoose";
import { NotificationOutbox, INotificationOutbox } from "@/models/NotificationOutbox";
import { NotificationDelivery, INotificationDelivery } from "@/models/NotificationDelivery";
import { NotificationTemplate } from "@/models/NotificationTemplate";
import { CommunicationConsent } from "@/models/CommunicationConsent";
import { WebhookReceipt } from "@/models/WebhookReceipt";
import {
  CommunicationsMetrics,
  NotificationDeliveryItem,
  NotificationTemplateItem,
  COMMUNICATION_EVENT_DEFINITIONS,
} from "@/types/communication";
import { Types } from "mongoose";

export interface DeliveryFilters {
  channel?: string;
  status?: string;
  eventType?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  perPage?: number;
}

export class CommunicationService {
  /**
   * Calculate Real Database-backed Metrics
   */
  public static async getMetrics(): Promise<CommunicationsMetrics> {
    await connectToDatabase();

    const [
      pendingCount,
      scheduledCount,
      sentCount,
      deliveredCount,
      failedCount,
      deadLetterCount,
      suppressedCount,
      lastWebhook,
      oldestPending,
    ] = await Promise.all([
      NotificationOutbox.countDocuments({ status: "PENDING", scheduledFor: { $lte: new Date() } }),
      NotificationOutbox.countDocuments({ status: "PENDING", scheduledFor: { $gt: new Date() } }),
      NotificationDelivery.countDocuments({ status: "SENT" }),
      NotificationDelivery.countDocuments({ status: { $in: ["DELIVERED", "READ"] } }),
      NotificationDelivery.countDocuments({ status: "FAILED" }),
      NotificationOutbox.countDocuments({ status: "DEAD_LETTER" }),
      CommunicationConsent.countDocuments({ consentStatus: { $regex: /^SUPPRESSED/ } }),
      WebhookReceipt.findOne().sort({ receivedAt: -1 }).lean(),
      NotificationOutbox.findOne({ status: "PENDING" }).sort({ createdAt: 1 }).lean(),
    ]);

    const totalDeliveries = sentCount + deliveredCount + failedCount;
    const deliveryRatePercent = totalDeliveries > 0 ? Math.round((deliveredCount / totalDeliveries) * 100) : 100;

    let oldestPendingMinutes: number | undefined;
    if (oldestPending?.createdAt) {
      oldestPendingMinutes = Math.max(0, Math.floor((Date.now() - new Date(oldestPending.createdAt).getTime()) / 60000));
    }

    const emailMode = (process.env.COMMUNICATIONS_MODE || "test").toLowerCase();
    const hasResend = !!process.env.RESEND_API_KEY;
    const hasWhatsApp = !!process.env.WHATSAPP_ACCESS_TOKEN;

    return {
      pendingCount,
      scheduledCount,
      sentCount,
      deliveredCount,
      failedCount,
      deadLetterCount,
      suppressedCount,
      deliveryRatePercent,
      lastWorkerRunAt: lastWebhook?.receivedAt?.toISOString() || new Date().toISOString(),
      oldestPendingMinutes,
      providerStatus: {
        email: emailMode === "live" && hasResend ? "LIVE" : "TEST_SIMULATOR",
        whatsapp: emailMode === "live" && hasWhatsApp ? "LIVE" : "TEST_SIMULATOR",
      },
    };
  }

  /**
   * Paginated Deliveries Audit History
   */
  public static async getDeliveries(filters: DeliveryFilters = {}) {
    await connectToDatabase();

    const page = Math.max(1, filters.page || 1);
    const perPage = Math.min(100, Math.max(1, filters.perPage || 20));
    const skip = (page - 1) * perPage;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {};

    if (filters.channel && filters.channel !== "ALL") query.channel = filters.channel;
    if (filters.status && filters.status !== "ALL") query.status = filters.status;
    if (filters.eventType && filters.eventType !== "ALL") query.eventType = filters.eventType;

    if (filters.dateFrom || filters.dateTo) {
      query.createdAt = {};
      if (filters.dateFrom) query.createdAt.$gte = new Date(filters.dateFrom);
      if (filters.dateTo) query.createdAt.$lte = new Date(`${filters.dateTo}T23:59:59.999Z`);
    }

    const [totalCount, items] = await Promise.all([
      NotificationDelivery.countDocuments(query),
      NotificationDelivery.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(perPage)
        .lean(),
    ]);

    const deliveries: NotificationDeliveryItem[] = items.map((d) => ({
      id: d._id.toString(),
      outboxId: d.outboxId.toString(),
      eventType: d.eventType,
      channel: d.channel,
      provider: d.provider,
      providerMessageId: d.providerMessageId,
      status: d.status,
      attempt: d.attempt,
      maskedRecipient: d.maskedRecipient,
      templateKey: COMMUNICATION_EVENT_DEFINITIONS[d.eventType]?.templateKey || d.eventType.toLowerCase(),
      sentAt: d.sentAt?.toISOString(),
      deliveredAt: d.deliveredAt?.toISOString(),
      readAt: d.readAt?.toISOString(),
      failedAt: d.failedAt?.toISOString(),
      failureCategory: d.failureCategory,
      failureMessage: d.failureMessage,
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
    }));

    return {
      items: deliveries,
      totalCount,
      page,
      perPage,
      totalPages: Math.ceil(totalCount / perPage),
    };
  }

  /**
   * Get Template Catalog
   */
  public static async getTemplates(): Promise<NotificationTemplateItem[]> {
    await connectToDatabase();

    const dbTemplates = await NotificationTemplate.find().lean();
    const dbMap = new Map(dbTemplates.map((t) => [`${t.key}:${t.channel}`, t]));

    const templates: NotificationTemplateItem[] = [];

    for (const [eventType, def] of Object.entries(COMMUNICATION_EVENT_DEFINITIONS)) {
      for (const channel of def.allowedChannels) {
        const key = def.templateKey;
        const existing = dbMap.get(`${key}:${channel}`);

        templates.push({
          key,
          channel,
          version: existing?.version || 1,
          purpose: "TRANSACTIONAL",
          subject: existing?.subject || `[${eventType}] Ratiwal Dream Estates`,
          previewText: existing?.previewText || def.description,
          allowedVariables: existing?.allowedVariables || ["customerName", "referenceNumber", "propertyTitle"],
          whatsappTemplateName: existing?.whatsappTemplateName || key,
          whatsappLanguage: existing?.whatsappLanguage || "en",
          whatsappStatus: existing?.whatsappStatus || (channel === "WHATSAPP" ? "APPROVED" : undefined),
          status: existing?.status || "ACTIVE",
          updatedAt: existing?.updatedAt?.toISOString() || new Date().toISOString(),
        });
      }
    }

    return templates;
  }

  /**
   * Paginated Dead-Letter Items
   */
  public static async getDeadLetterItems(page: number = 1, perPage: number = 20) {
    await connectToDatabase();

    const p = Math.max(1, page);
    const limit = Math.min(100, Math.max(1, perPage));
    const skip = (p - 1) * limit;

    const [totalCount, items] = await Promise.all([
      NotificationOutbox.countDocuments({ status: "DEAD_LETTER" }),
      NotificationOutbox.find({ status: "DEAD_LETTER" })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    return {
      items: items.map((o) => ({
        id: o._id.toString(),
        eventType: o.eventType,
        aggregateType: o.aggregateType,
        aggregateId: o.aggregateId.toString(),
        recipientType: o.recipientType,
        recipientEmail: o.recipientEmail,
        recipientPhone: o.recipientPhone,
        channels: o.channels,
        attemptCount: o.attemptCount,
        maxAttempts: o.maxAttempts,
        lastErrorCode: o.lastErrorCode,
        createdAt: o.createdAt.toISOString(),
        updatedAt: o.updatedAt.toISOString(),
      })),
      totalCount,
      page: p,
      perPage: limit,
      totalPages: Math.ceil(totalCount / limit),
    };
  }
}
