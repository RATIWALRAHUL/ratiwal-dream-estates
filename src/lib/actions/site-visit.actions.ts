"use server";
import "server-only";
import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/db/mongoose";
import {
  SiteVisit,
  VALID_SITE_VISIT_TRANSITIONS,
  type SiteVisitStatus,
  type SiteVisitPriority,
  type MeetingMode,
  type CancellationReason,
} from "@/models/SiteVisit";
import { AdvisorAvailability } from "@/models/AdvisorAvailability";
import { Lead } from "@/models/Lead";
import { Property } from "@/models/Property";
import { requireAdminSession } from "@/lib/auth/guard";
import { logAuditEvent } from "@/lib/services/audit.service";
import { logger } from "@/lib/logger";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { generateSiteVisitReferenceNumber } from "@/lib/utils/reference";
import { acquireSlotLocks, releaseSlotLocks } from "@/lib/services/site-visit-scheduling.service";
import { OutboxService } from "@/lib/communications/services/outbox.service";
import { NotificationProcessorService } from "@/lib/communications/services/processor.service";
import type { ActionResult } from "@/lib/actions/types";
import type { AvailabilityExceptionType } from "@/types/site-visit";
import { Types } from "mongoose";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function revalidateSiteVisits(visitId?: string) {
  revalidatePath("/dashboard/site-visits");
  revalidatePath("/dashboard/site-visits/calendar");
  if (visitId) revalidatePath(`/dashboard/site-visits/${visitId}`);
}

async function requireVisit(visitId: string, role?: string, userId?: string) {
  if (!Types.ObjectId.isValid(visitId)) return null;
  const visit = await SiteVisit.findById(visitId);
  if (!visit) return null;
  if (role === "EDITOR" && userId && visit.assignedAdvisorId !== userId) return null;
  return visit;
}

// ─── Server Actions ───────────────────────────────────────────────────────────

/**
 * Creates an internal site visit booking initiated by an admin or advisor.
 */
export async function createInternalSiteVisitAction(params: {
  leadId: string;
  propertyId: string;
  locationId?: string;
  scheduledStartAt: string;
  scheduledEndAt?: string;
  durationMinutes?: number;
  meetingMode: MeetingMode;
  visitorCount?: number;
  assignedAdvisorId?: string;
  assignedAdvisorName?: string;
  assignedAdvisorEmail?: string;
  meetingPointLabel?: string;
  meetingAddress?: string;
  meetingInstructions?: string;
  priority?: SiteVisitPriority;
  initialNote?: string;
}): Promise<ActionResult<{ visitId: string; referenceNumber: string }>> {
  try {
    const session = await requireAdminSession();
    await connectToDatabase();

    const startAt = new Date(params.scheduledStartAt);
    if (isNaN(startAt.getTime()) || startAt <= new Date()) {
      return { success: false, code: "PAST_DATE", message: "Scheduled date must be in the future." };
    }

    const duration = params.durationMinutes || 60;
    const endAt = params.scheduledEndAt
      ? new Date(params.scheduledEndAt)
      : new Date(startAt.getTime() + duration * 60 * 1000);

    const advisorId = params.assignedAdvisorId || session.user.id;
    const advisorName = params.assignedAdvisorName || session.user.name;
    const advisorEmail = params.assignedAdvisorEmail || session.user.email;

    const lead = await Lead.findById(params.leadId);
    if (!lead) return { success: false, code: "NOT_FOUND", message: "Lead not found." };

    const referenceNumber = generateSiteVisitReferenceNumber();
    const now = new Date();

    const visit = new SiteVisit({
      referenceNumber,
      leadId: new Types.ObjectId(params.leadId),
      propertyId: new Types.ObjectId(params.propertyId),
      locationId: params.locationId ? new Types.ObjectId(params.locationId) : undefined,
      assignedAdvisorId: advisorId,
      assignedAdvisorName: advisorName,
      assignedAdvisorEmail: advisorEmail,
      requestedBy: session.user.role === "EDITOR" ? "ADVISOR" : "ADMIN",
      source: "DASHBOARD_MANUAL",
      requestedStartAt: startAt,
      requestedEndAt: endAt,
      scheduledStartAt: startAt,
      scheduledEndAt: endAt,
      timezone: "Asia/Kolkata",
      durationMinutes: duration,
      bufferBeforeMinutes: 15,
      bufferAfterMinutes: 15,
      meetingMode: params.meetingMode,
      visitorCount: params.visitorCount || 1,
      meetingPointLabel: params.meetingPointLabel,
      meetingAddress: params.meetingAddress,
      meetingInstructions: params.meetingInstructions,
      status: "CONFIRMED",
      priority: params.priority || "NORMAL",
      confirmationStatus: "CONFIRMED",
      timeline: [
        {
          eventType: "VISIT_REQUESTED",
          actorType: "ADMIN_USER",
          actorId: session.user.id,
          actorName: session.user.name,
          summary: `Internal visit scheduled by ${session.user.name}`,
          occurredAt: now,
        },
        {
          eventType: "VISIT_CONFIRMED",
          actorType: "ADMIN_USER",
          actorId: session.user.id,
          actorName: session.user.name,
          summary: `Visit confirmed for ${startAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`,
          occurredAt: now,
        },
      ],
      notes: params.initialNote
        ? [
            {
              body: params.initialNote,
              authorId: session.user.id,
              authorName: session.user.name,
              authorEmail: session.user.email,
              createdAt: now,
            },
          ]
        : [],
    });

    // Acquire slot locks atomically
    const lockResult = await acquireSlotLocks(advisorId, visit._id as Types.ObjectId, startAt, endAt, 15, 15);
    if (!lockResult.success) {
      return {
        success: false,
        code: "ADVISOR_UNAVAILABLE",
        message: "Advisor has a scheduling conflict with another booking or buffer during this time.",
      };
    }

    await visit.save();

    await logAuditEvent({
      actor: session.user,
      action: "VISIT_CONFIRMED",
      targetSiteVisitId: visit._id,
      targetLeadId: lead._id,
      targetPropertyId: params.propertyId,
      reason: `Internal booking created and confirmed: ${referenceNumber}`,
    });

    revalidateSiteVisits(visit._id.toString());
    return {
      success: true,
      message: `Site visit ${referenceNumber} created and confirmed.`,
      data: { visitId: visit._id.toString(), referenceNumber },
    };
  } catch (error) {
    logger.error("[SiteVisit] createInternalSiteVisitAction failed", { error: error instanceof Error ? error.message : "Unknown" });
    return { success: false, code: "DATABASE_ERROR", message: "Failed to create internal visit." };
  }
}

/**
 * Assigns or reassigns an advisor to a site visit.
 */
export async function assignSiteVisitAction(
  visitId: string,
  advisorId: string,
  advisorName: string,
  advisorEmail: string,
  expectedVersion: number
): Promise<ActionResult> {
  try {
    const session = await requireAdminSession(["ADMIN", "SUPER_ADMIN"]);
    await connectToDatabase();

    const visit = await requireVisit(visitId);
    if (!visit) return { success: false, code: "NOT_FOUND", message: "Site visit not found." };
    if (visit.__v !== expectedVersion) return { success: false, code: "CONFLICT", message: "This visit was modified by another user. Please refresh." };
    if (visit.archivedAt) return { success: false, code: "ALREADY_ARCHIVED", message: "Archived visits cannot be modified." };

    const wasAssigned = !!visit.assignedAdvisorId;
    const now = new Date();

    // If visit is already confirmed, shift slot locks to the new advisor
    if (visit.status === "CONFIRMED" && visit.scheduledStartAt && visit.scheduledEndAt) {
      const lockResult = await acquireSlotLocks(
        advisorId,
        visit._id as Types.ObjectId,
        visit.scheduledStartAt,
        visit.scheduledEndAt,
        visit.bufferBeforeMinutes,
        visit.bufferAfterMinutes
      );
      if (!lockResult.success) {
        return { success: false, code: "ADVISOR_UNAVAILABLE", message: `Advisor ${advisorName} is unavailable during the scheduled time.` };
      }
    }

    visit.assignedAdvisorId = advisorId;
    visit.assignedAdvisorName = advisorName.trim();
    visit.assignedAdvisorEmail = advisorEmail.toLowerCase().trim();

    visit.timeline.push({
      eventType: wasAssigned ? "VISIT_REASSIGNED" : "VISIT_ASSIGNED",
      actorType: "ADMIN_USER",
      actorId: session.user.id,
      actorEmail: session.user.email,
      actorName: session.user.name,
      summary: wasAssigned ? `Reassigned to advisor ${advisorName}` : `Assigned to advisor ${advisorName}`,
      occurredAt: now,
    });

    await visit.save();

    await logAuditEvent({
      actor: session.user,
      action: wasAssigned ? "VISIT_REASSIGNED" : "VISIT_ASSIGNED",
      targetSiteVisitId: visit._id,
      reason: `Assigned to ${advisorName} (${advisorEmail})`,
    });

    revalidateSiteVisits(visitId);
    return { success: true, message: `Visit assigned to ${advisorName}.` };
  } catch (error) {
    logger.error("[SiteVisit] assignSiteVisitAction failed", { error: error instanceof Error ? error.message : "Unknown" });
    return { success: false, code: "DATABASE_ERROR", message: "Failed to assign advisor." };
  }
}

/**
 * Confirms a site visit schedule and acquires atomic slot locks.
 */
export async function confirmSiteVisitAction(
  visitId: string,
  scheduledStartAt: string,
  scheduledEndAt: string,
  advisorId: string,
  advisorName: string,
  advisorEmail: string,
  expectedVersion: number,
  meetingPointLabel?: string,
  meetingAddress?: string,
  meetingInstructions?: string,
  virtualMeetingUrl?: string
): Promise<ActionResult> {
  try {
    const session = await requireAdminSession();
    await connectToDatabase();

    const visit = await requireVisit(visitId, session.user.role, session.user.id);
    if (!visit) return { success: false, code: "NOT_FOUND", message: "Site visit not found or access denied." };
    if (visit.__v !== expectedVersion) return { success: false, code: "CONFLICT", message: "This visit was modified by another user. Please refresh." };

    const startAt = new Date(scheduledStartAt);
    const endAt = new Date(scheduledEndAt);
    if (isNaN(startAt.getTime()) || isNaN(endAt.getTime()) || startAt >= endAt) {
      return { success: false, code: "VALIDATION_ERROR", message: "Invalid scheduled start or end date/time." };
    }
    if (startAt <= new Date()) {
      return { success: false, code: "PAST_DATE", message: "Scheduled time must be in the future." };
    }

    const assignedId = advisorId || visit.assignedAdvisorId || session.user.id;
    const assignedName = advisorName || visit.assignedAdvisorName || session.user.name;
    const assignedEmail = advisorEmail || visit.assignedAdvisorEmail || session.user.email;

    // Acquire atomic slot locks
    const lockResult = await acquireSlotLocks(
      assignedId,
      visit._id as Types.ObjectId,
      startAt,
      endAt,
      visit.bufferBeforeMinutes || 15,
      visit.bufferAfterMinutes || 15
    );

    if (!lockResult.success) {
      return {
        success: false,
        code: "ADVISOR_UNAVAILABLE",
        message: "The assigned advisor is unavailable due to an existing booking or buffer overlap at this time.",
      };
    }

    const now = new Date();
    visit.status = "CONFIRMED";
    visit.confirmationStatus = "CONFIRMED";
    visit.scheduledStartAt = startAt;
    visit.scheduledEndAt = endAt;
    visit.assignedAdvisorId = assignedId;
    visit.assignedAdvisorName = assignedName;
    visit.assignedAdvisorEmail = assignedEmail;

    if (meetingPointLabel) visit.meetingPointLabel = meetingPointLabel.trim();
    if (meetingAddress) visit.meetingAddress = meetingAddress.trim();
    if (meetingInstructions) visit.meetingInstructions = meetingInstructions.trim();
    if (virtualMeetingUrl) visit.virtualMeetingUrl = virtualMeetingUrl.trim();

    visit.timeline.push({
      eventType: "VISIT_CONFIRMED",
      actorType: "ADMIN_USER",
      actorId: session.user.id,
      actorEmail: session.user.email,
      actorName: session.user.name,
      summary: `Visit confirmed for ${startAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} with ${assignedName}`,
      occurredAt: now,
    });

    await visit.save();

    await logAuditEvent({
      actor: session.user,
      action: "VISIT_CONFIRMED",
      targetSiteVisitId: visit._id,
      targetLeadId: visit.leadId,
      targetPropertyId: visit.propertyId,
      reason: `Confirmed for ${startAt.toISOString()}`,
    });

    revalidateSiteVisits(visitId);

    // ── Enqueue Outbox Notifications & Scheduled Reminders ───────────────────
    (async () => {
      try {
        const [lead, property] = await Promise.all([
          Lead.findById(visit.leadId, { fullName: 1, displayEmail: 1, normalizedPhone: 1 }).lean(),
          Property.findById(visit.propertyId, { title: 1 }).lean(),
        ]);

        const customerName = lead?.fullName || "Valued Client";
        const propertyTitle = property?.title || "Plotted Asset";
        const formattedTime = startAt.toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          dateStyle: "medium",
          timeStyle: "short",
        });

        // 1. Customer Confirmation Notice
        await OutboxService.enqueue({
          eventType: "SITE_VISIT_CONFIRMED_CUSTOMER",
          aggregateType: "SITE_VISIT",
          aggregateId: visit._id,
          aggregateVersion: visit.__v || 1,
          recipientType: "CUSTOMER",
          recipientEmail: lead?.displayEmail,
          recipientPhone: lead?.normalizedPhone,
          recipientName: customerName,
          variables: {
            customerName,
            referenceNumber: visit.referenceNumber,
            propertyTitle,
            scheduledTime: formattedTime,
            meetingPoint: visit.meetingPointLabel || "Main Gate / Site Office",
            advisorName: assignedName,
            advisorPhone: "+91 98765 43210",
          },
        });

        // 2. Schedule 24H Reminder
        const reminder24Ms = startAt.getTime() - 24 * 60 * 60 * 1000;
        if (reminder24Ms > Date.now()) {
          await OutboxService.enqueue({
            eventType: "SITE_VISIT_REMINDER_24H",
            aggregateType: "SITE_VISIT",
            aggregateId: visit._id,
            aggregateVersion: visit.__v || 1,
            recipientType: "CUSTOMER",
            recipientEmail: lead?.displayEmail,
            recipientPhone: lead?.normalizedPhone,
            recipientName: customerName,
            scheduledFor: new Date(reminder24Ms),
            variables: {
              customerName,
              referenceNumber: visit.referenceNumber,
              propertyTitle,
              scheduledTime: formattedTime,
              meetingPoint: visit.meetingPointLabel || "Main Gate",
            },
          });
        }

        // 3. Schedule 2H Reminder
        const reminder2Ms = startAt.getTime() - 2 * 60 * 60 * 1000;
        if (reminder2Ms > Date.now()) {
          await OutboxService.enqueue({
            eventType: "SITE_VISIT_REMINDER_2H",
            aggregateType: "SITE_VISIT",
            aggregateId: visit._id,
            aggregateVersion: visit.__v || 1,
            recipientType: "CUSTOMER",
            recipientEmail: lead?.displayEmail,
            recipientPhone: lead?.normalizedPhone,
            recipientName: customerName,
            scheduledFor: new Date(reminder2Ms),
            variables: {
              customerName,
              referenceNumber: visit.referenceNumber,
              propertyTitle,
              scheduledTime: formattedTime,
              meetingPoint: visit.meetingPointLabel || "Main Gate",
              advisorPhone: "+91 98765 43210",
            },
          });
        }

        NotificationProcessorService.processBatch(5).catch(() => {});
      } catch (err) {
        logger.error("[SiteVisit] Confirmation notification trigger error", { error: err });
      }
    })();

    return { success: true, message: "Site visit confirmed and locked." };
  } catch (error) {
    logger.error("[SiteVisit] confirmSiteVisitAction failed", { error: error instanceof Error ? error.message : "Unknown" });
    return { success: false, code: "DATABASE_ERROR", message: "Failed to confirm site visit." };
  }
}

/**
 * Reschedules an existing site visit to a new date/time with atomic lock swap.
 */
export async function rescheduleSiteVisitAction(
  visitId: string,
  newStartAt: string,
  newEndAt: string,
  reason: string,
  expectedVersion: number
): Promise<ActionResult> {
  try {
    const session = await requireAdminSession();
    await connectToDatabase();

    const visit = await requireVisit(visitId, session.user.role, session.user.id);
    if (!visit) return { success: false, code: "NOT_FOUND", message: "Site visit not found or access denied." };
    if (visit.__v !== expectedVersion) return { success: false, code: "CONFLICT", message: "This visit was modified by another user. Please refresh." };
    if (visit.status === "COMPLETED" || visit.status === "CANCELLED" || visit.status === "ARCHIVED") {
      return { success: false, code: "INVALID_STATUS_TRANSITION", message: `Cannot reschedule a ${visit.status.toLowerCase()} visit.` };
    }

    if (!reason || !reason.trim()) {
      return { success: false, code: "VALIDATION_ERROR", message: "A reason is required when rescheduling a visit." };
    }

    const startAt = new Date(newStartAt);
    const endAt = new Date(newEndAt);
    if (isNaN(startAt.getTime()) || isNaN(endAt.getTime()) || startAt >= endAt) {
      return { success: false, code: "VALIDATION_ERROR", message: "Invalid reschedule time range." };
    }
    if (startAt <= new Date()) {
      return { success: false, code: "PAST_DATE", message: "Reschedule time must be in the future." };
    }

    const advisorId = visit.assignedAdvisorId || session.user.id;

    // Acquire atomic locks for the new interval
    const lockResult = await acquireSlotLocks(
      advisorId,
      visit._id as Types.ObjectId,
      startAt,
      endAt,
      visit.bufferBeforeMinutes || 15,
      visit.bufferAfterMinutes || 15
    );

    if (!lockResult.success) {
      return {
        success: false,
        code: "ADVISOR_UNAVAILABLE",
        message: "The advisor has a conflict during the requested reschedule time.",
      };
    }

    const prevStart = visit.scheduledStartAt || visit.requestedStartAt;
    const now = new Date();

    visit.scheduledStartAt = startAt;
    visit.scheduledEndAt = endAt;
    visit.status = "CONFIRMED";
    visit.confirmationStatus = "CONFIRMED";

    visit.timeline.push({
      eventType: "VISIT_RESCHEDULED",
      actorType: "ADMIN_USER",
      actorId: session.user.id,
      actorEmail: session.user.email,
      actorName: session.user.name,
      summary: `Rescheduled from ${prevStart.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} to ${startAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} (${reason.trim()})`,
      occurredAt: now,
    });

    await visit.save();

    await logAuditEvent({
      actor: session.user,
      action: "VISIT_RESCHEDULED",
      targetSiteVisitId: visit._id,
      reason: `Rescheduled: ${reason.trim()}`,
      changes: [{ field: "scheduledStartAt", from: prevStart, to: startAt }],
    });

    revalidateSiteVisits(visitId);

    // ── Cancel Old Reminders and Enqueue Reschedule Notice ───────────────────
    (async () => {
      try {
        await OutboxService.cancelPendingReminders("SITE_VISIT", visit._id, "RESCHEDULED");

        const [lead, property] = await Promise.all([
          Lead.findById(visit.leadId, { fullName: 1, displayEmail: 1, normalizedPhone: 1 }).lean(),
          Property.findById(visit.propertyId, { title: 1 }).lean(),
        ]);

        const customerName = lead?.fullName || "Valued Client";
        const propertyTitle = property?.title || "Plotted Asset";
        const formattedNewTime = startAt.toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          dateStyle: "medium",
          timeStyle: "short",
        });

        // Customer Reschedule Notice
        await OutboxService.enqueue({
          eventType: "SITE_VISIT_RESCHEDULED_CUSTOMER",
          aggregateType: "SITE_VISIT",
          aggregateId: visit._id,
          aggregateVersion: visit.__v || 1,
          recipientType: "CUSTOMER",
          recipientEmail: lead?.displayEmail,
          recipientPhone: lead?.normalizedPhone,
          recipientName: customerName,
          variables: {
            customerName,
            referenceNumber: visit.referenceNumber,
            propertyTitle,
            newScheduledTime: formattedNewTime,
            reason: reason.trim(),
          },
        });

        // Re-schedule 24H Reminder
        const reminder24Ms = startAt.getTime() - 24 * 60 * 60 * 1000;
        if (reminder24Ms > Date.now()) {
          await OutboxService.enqueue({
            eventType: "SITE_VISIT_REMINDER_24H",
            aggregateType: "SITE_VISIT",
            aggregateId: visit._id,
            aggregateVersion: visit.__v || 1,
            recipientType: "CUSTOMER",
            recipientEmail: lead?.displayEmail,
            recipientPhone: lead?.normalizedPhone,
            recipientName: customerName,
            scheduledFor: new Date(reminder24Ms),
            variables: {
              customerName,
              referenceNumber: visit.referenceNumber,
              propertyTitle,
              scheduledTime: formattedNewTime,
              meetingPoint: visit.meetingPointLabel || "Main Gate",
            },
          });
        }

        NotificationProcessorService.processBatch(5).catch(() => {});
      } catch (err) {
        logger.error("[SiteVisit] Reschedule notification error", { error: err });
      }
    })();

    return { success: true, message: "Site visit rescheduled and locked." };
  } catch (error) {
    logger.error("[SiteVisit] rescheduleSiteVisitAction failed", { error: error instanceof Error ? error.message : "Unknown" });
    return { success: false, code: "DATABASE_ERROR", message: "Failed to reschedule visit." };
  }
}

/**
 * Cancels a site visit with mandatory controlled reason and releases slot locks.
 */
export async function cancelSiteVisitAction(
  visitId: string,
  reason: CancellationReason,
  note: string | undefined,
  expectedVersion: number
): Promise<ActionResult> {
  try {
    const session = await requireAdminSession();
    await connectToDatabase();

    const visit = await requireVisit(visitId, session.user.role, session.user.id);
    if (!visit) return { success: false, code: "NOT_FOUND", message: "Site visit not found or access denied." };
    if (visit.__v !== expectedVersion) return { success: false, code: "CONFLICT", message: "This visit was modified by another user. Please refresh." };
    if (visit.status === "CANCELLED" || visit.status === "COMPLETED" || visit.status === "ARCHIVED") {
      return { success: false, code: "INVALID_STATUS_TRANSITION", message: `Cannot cancel a ${visit.status.toLowerCase()} visit.` };
    }

    const now = new Date();
    visit.status = "CANCELLED";
    visit.cancellationReason = reason;
    visit.cancellationNote = note?.trim();
    visit.cancelledAt = now;

    // Release all active slot locks
    await releaseSlotLocks(visit._id as Types.ObjectId);

    visit.timeline.push({
      eventType: "VISIT_CANCELLED",
      actorType: "ADMIN_USER",
      actorId: session.user.id,
      actorEmail: session.user.email,
      actorName: session.user.name,
      summary: `Visit cancelled (${reason.replace(/_/g, " ").toLowerCase()})${note ? `: ${note.trim()}` : ""}`,
      occurredAt: now,
    });

    await visit.save();

    await logAuditEvent({
      actor: session.user,
      action: "VISIT_CANCELLED",
      targetSiteVisitId: visit._id,
      reason: `Cancelled: ${reason}${note ? ` (${note})` : ""}`,
    });

    revalidateSiteVisits(visitId);

    // ── Cancel Reminders and Enqueue Cancellation Notice ─────────────────────
    (async () => {
      try {
        await OutboxService.cancelPendingReminders("SITE_VISIT", visit._id, "CANCELLED");

        const [lead, property] = await Promise.all([
          Lead.findById(visit.leadId, { fullName: 1, displayEmail: 1, normalizedPhone: 1 }).lean(),
          Property.findById(visit.propertyId, { title: 1 }).lean(),
        ]);

        const customerName = lead?.fullName || "Valued Client";
        const propertyTitle = property?.title || "Plotted Asset";

        // Customer Cancellation Notice
        await OutboxService.enqueue({
          eventType: "SITE_VISIT_CANCELLED_CUSTOMER",
          aggregateType: "SITE_VISIT",
          aggregateId: visit._id,
          aggregateVersion: visit.__v || 1,
          recipientType: "CUSTOMER",
          recipientEmail: lead?.displayEmail,
          recipientPhone: lead?.normalizedPhone,
          recipientName: customerName,
          variables: {
            customerName,
            referenceNumber: visit.referenceNumber,
            propertyTitle,
            reason: note ? `${reason.replace(/_/g, " ")} (${note.trim()})` : reason.replace(/_/g, " "),
          },
        });

        // In-App alert to assigned advisor (if assigned)
        if (visit.assignedAdvisorId && visit.assignedAdvisorId !== session.user.id) {
          await OutboxService.enqueue({
            eventType: "SITE_VISIT_CANCELLED_CUSTOMER", // In-App channel mapping
            aggregateType: "SITE_VISIT",
            aggregateId: visit._id,
            aggregateVersion: visit.__v || 1,
            recipientType: "ADVISOR",
            recipientAdminId: visit.assignedAdvisorId,
            channels: ["IN_APP"],
            variables: {
              customerName,
              referenceNumber: visit.referenceNumber,
              propertyTitle,
              reason: note || reason,
            },
          });
        }

        NotificationProcessorService.processBatch(5).catch(() => {});
      } catch (err) {
        logger.error("[SiteVisit] Cancel notification error", { error: err });
      }
    })();

    return { success: true, message: "Site visit cancelled and locks released." };
  } catch (error) {
    logger.error("[SiteVisit] cancelSiteVisitAction failed", { error: error instanceof Error ? error.message : "Unknown" });
    return { success: false, code: "DATABASE_ERROR", message: "Failed to cancel site visit." };
  }
}

/**
 * Marks a site visit as completed with outcome notes.
 */
export async function completeSiteVisitAction(
  visitId: string,
  params: {
    outcomeSummary: string;
    customerInterestLevel?: "HIGH" | "MEDIUM" | "LOW" | "UNDECIDED";
    followUpRecommendation?: string;
  },
  expectedVersion: number
): Promise<ActionResult> {
  try {
    const session = await requireAdminSession();
    await connectToDatabase();

    const visit = await requireVisit(visitId, session.user.role, session.user.id);
    if (!visit) return { success: false, code: "NOT_FOUND", message: "Site visit not found or access denied." };
    if (visit.__v !== expectedVersion) return { success: false, code: "CONFLICT", message: "This visit was modified by another user. Please refresh." };
    if (visit.status !== "CONFIRMED") {
      return { success: false, code: "INVALID_STATUS_TRANSITION", message: "Only confirmed visits can be marked as completed." };
    }

    const now = new Date();
    visit.status = "COMPLETED";
    visit.completedAt = now;
    visit.outcomeSummary = params.outcomeSummary.trim();
    visit.customerInterestLevel = params.customerInterestLevel;
    visit.followUpRecommendation = params.followUpRecommendation?.trim();

    // Release locks upon completion
    await releaseSlotLocks(visit._id as Types.ObjectId);

    visit.timeline.push({
      eventType: "VISIT_COMPLETED",
      actorType: "ADMIN_USER",
      actorId: session.user.id,
      actorEmail: session.user.email,
      actorName: session.user.name,
      summary: `Visit completed. Interest: ${params.customerInterestLevel || "N/A"}`,
      occurredAt: now,
    });

    await visit.save();

    await logAuditEvent({
      actor: session.user,
      action: "VISIT_COMPLETED",
      targetSiteVisitId: visit._id,
      reason: params.outcomeSummary.trim(),
    });

    revalidateSiteVisits(visitId);
    return { success: true, message: "Site visit marked as completed." };
  } catch (error) {
    logger.error("[SiteVisit] completeSiteVisitAction failed", { error: error instanceof Error ? error.message : "Unknown" });
    return { success: false, code: "DATABASE_ERROR", message: "Failed to complete site visit." };
  }
}

/**
 * Marks a site visit as a NO_SHOW with required note.
 */
export async function markSiteVisitNoShowAction(
  visitId: string,
  note: string,
  expectedVersion: number
): Promise<ActionResult> {
  try {
    const session = await requireAdminSession();
    await connectToDatabase();

    if (!note || !note.trim()) {
      return { success: false, code: "VALIDATION_ERROR", message: "A note is required when recording a no-show." };
    }

    const visit = await requireVisit(visitId, session.user.role, session.user.id);
    if (!visit) return { success: false, code: "NOT_FOUND", message: "Site visit not found or access denied." };
    if (visit.__v !== expectedVersion) return { success: false, code: "CONFLICT", message: "This visit was modified by another user. Please refresh." };
    if (visit.status !== "CONFIRMED") {
      return { success: false, code: "INVALID_STATUS_TRANSITION", message: "Only confirmed visits can be marked as no-show." };
    }

    const now = new Date();
    visit.status = "NO_SHOW";
    visit.noShowRecordedAt = now;
    visit.noShowNote = note.trim();

    await releaseSlotLocks(visit._id as Types.ObjectId);

    visit.timeline.push({
      eventType: "NO_SHOW_RECORDED",
      actorType: "ADMIN_USER",
      actorId: session.user.id,
      actorEmail: session.user.email,
      actorName: session.user.name,
      summary: `Visitor did not arrive: ${note.trim()}`,
      occurredAt: now,
    });

    await visit.save();

    await logAuditEvent({
      actor: session.user,
      action: "VISIT_NO_SHOW",
      targetSiteVisitId: visit._id,
      reason: note.trim(),
    });

    revalidateSiteVisits(visitId);
    return { success: true, message: "No-show recorded." };
  } catch (error) {
    logger.error("[SiteVisit] markSiteVisitNoShowAction failed", { error: error instanceof Error ? error.message : "Unknown" });
    return { success: false, code: "DATABASE_ERROR", message: "Failed to record no-show." };
  }
}

/**
 * Adds an internal note to a site visit.
 */
export async function addSiteVisitNoteAction(
  visitId: string,
  body: string,
  expectedVersion: number
): Promise<ActionResult> {
  try {
    const session = await requireAdminSession();
    await connectToDatabase();

    const trimmed = body?.trim().replace(/<[^>]+>/g, "");
    if (!trimmed || trimmed.length < 2) {
      return { success: false, code: "VALIDATION_ERROR", message: "Note must be at least 2 characters." };
    }

    const visit = await requireVisit(visitId, session.user.role, session.user.id);
    if (!visit) return { success: false, code: "NOT_FOUND", message: "Site visit not found or access denied." };
    if (visit.__v !== expectedVersion) return { success: false, code: "CONFLICT", message: "This visit was modified by another user. Please refresh." };

    const now = new Date();
    visit.notes.push({
      body: trimmed,
      authorId: session.user.id,
      authorEmail: session.user.email,
      authorName: session.user.name,
      createdAt: now,
    });

    visit.timeline.push({
      eventType: "NOTE_ADDED",
      actorType: "ADMIN_USER",
      actorId: session.user.id,
      actorEmail: session.user.email,
      actorName: session.user.name,
      summary: `Note added by ${session.user.name}`,
      occurredAt: now,
    });

    await visit.save();

    await logAuditEvent({
      actor: session.user,
      action: "VISIT_NOTE_ADDED",
      targetSiteVisitId: visit._id,
    });

    revalidateSiteVisits(visitId);
    return { success: true, message: "Note added." };
  } catch (error) {
    logger.error("[SiteVisit] addSiteVisitNoteAction failed", { error: error instanceof Error ? error.message : "Unknown" });
    return { success: false, code: "DATABASE_ERROR", message: "Failed to add note." };
  }
}

/**
 * Updates an advisor's weekly availability schedule and buffers.
 */
export async function updateAdvisorAvailabilityAction(params: {
  advisorId: string;
  weeklySchedule: { dayOfWeek: number; startLocalTime: string; endLocalTime: string; active: boolean }[];
  defaultVisitDurationMinutes?: number;
  bufferBeforeMinutes?: number;
  bufferAfterMinutes?: number;
  minBookingNoticeHours?: number;
  maxAdvanceBookingDays?: number;
}): Promise<ActionResult> {
  try {
    const session = await requireAdminSession(["ADMIN", "SUPER_ADMIN"]);
    await connectToDatabase();

    await AdvisorAvailability.findOneAndUpdate(
      { advisorId: params.advisorId },
      {
        $set: {
          weeklySchedule: params.weeklySchedule,
          defaultVisitDurationMinutes: params.defaultVisitDurationMinutes || 60,
          bufferBeforeMinutes: params.bufferBeforeMinutes ?? 15,
          bufferAfterMinutes: params.bufferAfterMinutes ?? 15,
          minBookingNoticeHours: params.minBookingNoticeHours || 4,
          maxAdvanceBookingDays: params.maxAdvanceBookingDays || 30,
        },
      },
      { upsert: true, new: true }
    );

    await logAuditEvent({
      actor: session.user,
      action: "AVAILABILITY_UPDATED",
      reason: `Updated availability rules for advisor ${params.advisorId}`,
    });

    revalidatePath("/dashboard/site-visits/availability");
    return { success: true, message: "Advisor availability updated successfully." };
  } catch (error) {
    logger.error("[SiteVisit] updateAdvisorAvailabilityAction failed", { error: error instanceof Error ? error.message : "Unknown" });
    return { success: false, code: "DATABASE_ERROR", message: "Failed to update availability." };
  }
}

/**
 * Adds an exception (e.g. holiday, leave, blackout date) to an advisor's availability.
 */
export async function addAvailabilityExceptionAction(
  advisorId: string,
  date: string, // YYYY-MM-DD
  type: AvailabilityExceptionType,
  reason: string,
  startLocalTime?: string,
  endLocalTime?: string
): Promise<ActionResult> {
  try {
    const session = await requireAdminSession(["ADMIN", "SUPER_ADMIN"]);
    await connectToDatabase();

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return { success: false, code: "VALIDATION_ERROR", message: "Invalid date format (YYYY-MM-DD required)." };
    }
    if (!reason || !reason.trim()) {
      return { success: false, code: "VALIDATION_ERROR", message: "A reason is required for availability exceptions." };
    }

    await AdvisorAvailability.findOneAndUpdate(
      { advisorId },
      {
        $push: {
          exceptions: {
            date,
            type,
            reason: reason.trim(),
            startLocalTime,
            endLocalTime,
            createdAt: new Date(),
          },
        },
      },
      { upsert: true }
    );

    await logAuditEvent({
      actor: session.user,
      action: "AVAILABILITY_EXCEPTION_ADDED",
      reason: `${type} exception on ${date}: ${reason.trim()}`,
    });

    revalidatePath("/dashboard/site-visits/availability");
    return { success: true, message: "Exception added to availability calendar." };
  } catch (error) {
    logger.error("[SiteVisit] addAvailabilityExceptionAction failed", { error: error instanceof Error ? error.message : "Unknown" });
    return { success: false, code: "DATABASE_ERROR", message: "Failed to add exception." };
  }
}

/**
 * Removes an exception from an advisor's availability.
 */
export async function removeAvailabilityExceptionAction(
  advisorId: string,
  exceptionId: string
): Promise<ActionResult> {
  try {
    const session = await requireAdminSession(["ADMIN", "SUPER_ADMIN"]);
    await connectToDatabase();

    await AdvisorAvailability.findOneAndUpdate(
      { advisorId },
      { $pull: { exceptions: { _id: new Types.ObjectId(exceptionId) } } }
    );

    await logAuditEvent({
      actor: session.user,
      action: "AVAILABILITY_EXCEPTION_REMOVED",
      reason: `Removed exception ${exceptionId} from advisor ${advisorId}`,
    });

    revalidatePath("/dashboard/site-visits/availability");
    return { success: true, message: "Exception removed." };
  } catch (error) {
    logger.error("[SiteVisit] removeAvailabilityExceptionAction failed", { error: error instanceof Error ? error.message : "Unknown" });
    return { success: false, code: "DATABASE_ERROR", message: "Failed to remove exception." };
  }
}
