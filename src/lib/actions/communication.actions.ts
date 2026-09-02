"use server";

import { getAdminSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongoose";
import { InAppNotification } from "@/models/InAppNotification";
import { NotificationOutbox } from "@/models/NotificationOutbox";
import { OutboxService } from "@/lib/communications/services/outbox.service";
import { NotificationProcessorService } from "@/lib/communications/services/processor.service";
import { ActionResult } from "./types";
import { InAppNotificationItem, NotificationEventType } from "@/types/communication";
import { Types } from "mongoose";

/**
 * Fetch In-App notifications for current user
 */
export async function getInAppNotificationsAction(): Promise<{
  unreadCount: number;
  notifications: InAppNotificationItem[];
}> {
  try {
    const session = await getAdminSession();
    await connectToDatabase();

    const recipientIds = session?.user?.id ? ["ALL_ADMINS", session.user.id] : ["ALL_ADMINS"];
    const recipientFilter = {
      $or: [
        { recipientAdminId: { $in: recipientIds } },
        { recipientAdminId: { $exists: false } },
        { recipientAdminId: null },
        { recipientAdminId: "" },
      ],
    };

    const [unreadCount, items] = await Promise.all([
      InAppNotification.countDocuments({
        ...recipientFilter,
        readAt: null,
        archivedAt: null,
      }).maxTimeMS(3000),
      InAppNotification.find({
        ...recipientFilter,
        archivedAt: null,
      })
        .select({
          _id: 1,
          eventType: 1,
          title: 1,
          message: 1,
          entityType: 1,
          entityId: 1,
          deepLink: 1,
          readAt: 1,
          createdAt: 1,
        })
        .sort({ createdAt: -1 })
        .limit(30)
        .maxTimeMS(3000)
        .lean(),
    ]);

    const notifications: InAppNotificationItem[] = items.map((n) => ({
      id: n._id.toString(),
      eventType: n.eventType,
      title: n.title,
      message: n.message,
      entityType: n.entityType,
      entityId: n.entityId,
      deepLink: n.deepLink,
      readAt: n.readAt ? n.readAt.toISOString() : undefined,
      createdAt: n.createdAt ? n.createdAt.toISOString() : new Date().toISOString(),
    }));

    return { unreadCount, notifications };
  } catch {
    return { unreadCount: 0, notifications: [] };
  }
}

/**
 * Mark a single in-app notification as read
 */
export async function markInAppNotificationReadAction(notificationId: string): Promise<ActionResult> {
  try {
    if (!Types.ObjectId.isValid(notificationId)) {
      return { success: false, code: "VALIDATION_ERROR", message: "Invalid notification ID" };
    }

    await connectToDatabase();

    await InAppNotification.updateOne(
      { _id: new Types.ObjectId(notificationId) },
      { $set: { readAt: new Date() } }
    );

    return { success: true, message: "Marked as read" };
  } catch (error) {
    return { success: false, code: "DATABASE_ERROR", message: "Failed to mark as read" };
  }
}

/**
 * Mark all in-app notifications as read
 */
export async function markAllInAppNotificationsReadAction(): Promise<ActionResult> {
  try {
    const session = await getAdminSession();
    await connectToDatabase();

    const recipientIds = session?.user?.id ? ["ALL_ADMINS", session.user.id] : ["ALL_ADMINS"];
    const recipientFilter = {
      $or: [
        { recipientAdminId: { $in: recipientIds } },
        { recipientAdminId: { $exists: false } },
        { recipientAdminId: null },
        { recipientAdminId: "" },
      ],
    };

    await InAppNotification.updateMany(
      {
        ...recipientFilter,
        readAt: null,
      },
      { $set: { readAt: new Date() } }
    );

    return { success: true, message: "All notifications marked as read" };
  } catch (error) {
    return { success: false, code: "DATABASE_ERROR", message: "Failed to mark all as read" };
  }
}

/**
 * Archive an in-app notification
 */
export async function archiveInAppNotificationAction(notificationId: string): Promise<ActionResult> {
  const session = await getAdminSession();
  if (!session) return { success: false, code: "UNAUTHORIZED", message: "Unauthorized" };

  if (!Types.ObjectId.isValid(notificationId)) {
    return { success: false, code: "VALIDATION_ERROR", message: "Invalid notification ID" };
  }

  await connectToDatabase();

  await InAppNotification.updateOne(
    { _id: new Types.ObjectId(notificationId) },
    { $set: { archivedAt: new Date() } }
  );

  return { success: true, message: "Notification archived" };
}

/**
 * Retry a Dead-Letter outbox item (Super Admin Only)
 */
export async function retryDeadLetterAction(outboxId: string): Promise<ActionResult> {
  const session = await getAdminSession();
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return { success: false, code: "FORBIDDEN", message: "Super Admin privileges required to retry dead-letter items" };
  }

  if (!Types.ObjectId.isValid(outboxId)) {
    return { success: false, code: "VALIDATION_ERROR", message: "Invalid outbox ID" };
  }

  await connectToDatabase();

  const updated = await NotificationOutbox.findOneAndUpdate(
    { _id: new Types.ObjectId(outboxId), status: "DEAD_LETTER" },
    {
      $set: {
        status: "PENDING",
        nextAttemptAt: new Date(),
        leaseUntil: null,
        lastErrorCode: null,
      },
    },
    { new: true }
  );

  if (!updated) {
    return { success: false, code: "NOT_FOUND", message: "Dead-letter outbox item not found" };
  }

  // Trigger batch processing
  NotificationProcessorService.processBatch(5).catch(() => {});

  return { success: true, message: "Outbox item queued for immediate retry" };
}

/**
 * Super Admin Test-Send action to verified allowlist recipient
 */
export async function testSendNotificationAction(
  eventType: NotificationEventType,
  recipientEmail?: string,
  recipientPhone?: string
): Promise<ActionResult> {
  const session = await getAdminSession();
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return { success: false, code: "FORBIDDEN", message: "Super Admin privileges required for test sending" };
  }

  if (!recipientEmail && !recipientPhone) {
    return { success: false, code: "VALIDATION_ERROR", message: "Recipient email or phone is required" };
  }

  await OutboxService.enqueue({
    eventType,
    aggregateType: "USER",
    aggregateId: new Types.ObjectId(),
    recipientType: "CUSTOMER",
    recipientEmail,
    recipientPhone,
    recipientName: "Test Sandbox Recipient",
    variables: {
      customerName: "Test Sandbox User",
      referenceNumber: `TEST-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      propertyTitle: "Royal Palms Township (Test Sample)",
      scheduledTime: "Tomorrow, 11:00 AM (IST)",
      meetingPoint: "Project Gate 1 (Test)",
      advisorName: session.user.name,
      advisorPhone: "+91 98765 43210",
    },
  });

  // Execute immediate batch
  NotificationProcessorService.processBatch(5).catch(() => {});

  return { success: true, message: `Test ${eventType} notification queued successfully` };
}
