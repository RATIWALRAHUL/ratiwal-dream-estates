"use server";
import "server-only";
import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Lead, VALID_STATUS_TRANSITIONS, type LeadStatus, type LeadPriority, type ContactAttemptType, type ContactAttemptOutcome, type LostReason } from "@/models/Lead";
import { LeadStageHistory } from "@/models/LeadStageHistory";
import { requireAdminSession } from "@/lib/auth/guard";
import { logAuditEvent } from "@/lib/services/audit.service";
import { logger } from "@/lib/logger";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { OutboxService } from "@/lib/communications/services/outbox.service";
import type { ActionResult } from "@/lib/actions/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function revalidateLeads(leadId?: string) {
  revalidatePath("/dashboard/leads");
  if (leadId) revalidatePath(`/dashboard/leads/${leadId}`);
}

/**
 * Shared guard: authenticate + check active + load latest lead.
 * Returns null if lead not found or EDITOR does not have scope.
 */
async function requireLead(leadId: string, role?: string, userId?: string) {
  const lead = await Lead.findById(leadId);
  if (!lead) return null;
  if (role === "EDITOR" && userId && lead.assignedToId !== userId) return null;
  return lead;
}

// ─── Actions ──────────────────────────────────────────────────────────────────

/**
 * Assign or reassign a lead to an authorized staff member.
 * Any ADMIN/SUPER_ADMIN can assign. EDITOR cannot assign.
 */
export async function assignLeadAction(
  leadId: string,
  assigneeId: string,
  assigneeEmail: string,
  assigneeName: string,
  expectedVersion: number
): Promise<ActionResult<{ assignedAt: string }>> {
  try {
    const session = await requireAdminSession(["ADMIN", "SUPER_ADMIN"]);
    await connectToDatabase();

    const rl = checkRateLimit(`lead-mutation:${session.user.id}`, RATE_LIMITS.LEAD_MUTATION.limit, RATE_LIMITS.LEAD_MUTATION.windowMs);
    if (!rl.allowed) return { success: false, code: "VALIDATION_ERROR", message: "Too many requests. Please slow down." };

    if (!assigneeId?.trim() || !assigneeEmail?.trim() || !assigneeName?.trim()) {
      return { success: false, code: "INVALID_ASSIGNEE", message: "Assignee details are required." };
    }

    const lead = await requireLead(leadId);
    if (!lead) return { success: false, code: "NOT_FOUND", message: "Lead not found." };
    if (lead.__v !== expectedVersion) return { success: false, code: "CONFLICT", message: "This lead was updated by another user. Please refresh and try again." };
    if (lead.archivedAt) return { success: false, code: "ALREADY_ARCHIVED", message: "Archived leads cannot be modified." };

    const wasAssigned = !!lead.assignedToId;
    const now = new Date();

    lead.assignedToId = assigneeId;
    lead.assignedToEmail = assigneeEmail.toLowerCase().trim();
    lead.assignedToName = assigneeName.trim();
    lead.assignedAt = now;

    const eventType = wasAssigned ? "LEAD_REASSIGNED" : "LEAD_ASSIGNED";
    lead.timeline.push({
      eventType,
      actorType: "ADMIN_USER",
      actorId: session.user.id,
      actorEmail: session.user.email,
      actorName: session.user.name,
      summary: wasAssigned
        ? `Lead reassigned to ${assigneeName}`
        : `Lead assigned to ${assigneeName}`,
      occurredAt: now,
    });

    await lead.save();

    await logAuditEvent({
      actor: session.user,
      action: wasAssigned ? "LEAD_REASSIGNED" : "LEAD_ASSIGNED",
      targetLeadId: lead._id,
      reason: `Assigned to ${assigneeName} (${assigneeEmail})`,
    });

    revalidateLeads(leadId);

    // Enqueue internal assignment alert to assignee
    OutboxService.enqueue({
      eventType: "LEAD_ASSIGNED_INTERNAL",
      aggregateType: "LEAD",
      aggregateId: lead._id,
      aggregateVersion: lead.__v || 1,
      recipientType: "ADVISOR",
      recipientAdminId: assigneeId,
      recipientEmail: assigneeEmail,
      recipientName: assigneeName,
      variables: {
        advisorName: assigneeName,
        leadName: lead.fullName,
        leadId: lead._id.toString(),
      },
    }).catch(() => {});

    return { success: true, message: `Lead assigned to ${assigneeName}.`, data: { assignedAt: now.toISOString() } };
  } catch (error) {
    logger.error("[Lead] assignLeadAction failed", { error: error instanceof Error ? error.message : "Unknown" });
    return { success: false, code: "DATABASE_ERROR", message: "Failed to assign lead. Please try again." };
  }
}

/**
 * Change lead status with transition validation.
 * LOST requires a lostReason.
 */
export async function changeLeadStatusAction(
  leadId: string,
  newStatus: LeadStatus,
  expectedVersion: number,
  lostReason?: LostReason,
  lostExplanation?: string,
  reason?: string
): Promise<ActionResult> {
  try {
    const session = await requireAdminSession();
    await connectToDatabase();

    const rl = checkRateLimit(`lead-mutation:${session.user.id}`, RATE_LIMITS.LEAD_MUTATION.limit, RATE_LIMITS.LEAD_MUTATION.windowMs);
    if (!rl.allowed) return { success: false, code: "VALIDATION_ERROR", message: "Too many requests." };

    const lead = await requireLead(leadId, session.user.role, session.user.id);
    if (!lead) return { success: false, code: "NOT_FOUND", message: "Lead not found or access denied." };
    if (lead.__v !== expectedVersion) return { success: false, code: "CONFLICT", message: "This lead was updated by another user. Please refresh and try again." };

    const currentStatus = lead.status as LeadStatus;
    if (!VALID_STATUS_TRANSITIONS[currentStatus]?.includes(newStatus)) {
      return {
        success: false,
        code: "INVALID_STATUS_TRANSITION",
        message: `Cannot change status from ${currentStatus} to ${newStatus}.`,
      };
    }

    if (newStatus === "LOST" && !lostReason) {
      return { success: false, code: "VALIDATION_ERROR", message: "A lost reason is required when marking a lead as lost.", fieldErrors: { lostReason: ["Required"] } };
    }

    const now = new Date();
    const prevStatus = lead.status;
    lead.status = newStatus;

    if (newStatus === "LOST") {
      lead.lostReason = lostReason;
      lead.lostExplanation = lostExplanation?.trim();
    }
    if (newStatus === "ARCHIVED") lead.archivedAt = now;

    lead.timeline.push({
      eventType: "STATUS_CHANGED",
      actorType: "ADMIN_USER",
      actorId: session.user.id,
      actorEmail: session.user.email,
      actorName: session.user.name,
      summary: `Status changed from ${prevStatus} to ${newStatus}${reason ? `: ${reason}` : ""}`,
      occurredAt: now,
    });

    await lead.save();

    // ── Append-only LeadStageHistory Entry ────────────────────────────────────
    try {
      const lastStageEntry = await LeadStageHistory.findOne({ leadId: lead._id })
        .sort({ changedAt: -1 })
        .lean();

      const lastChangeTimestamp = lastStageEntry?.changedAt
        ? new Date(lastStageEntry.changedAt).getTime()
        : new Date(lead.createdAt).getTime();

      const durationInPreviousStageMs = Math.max(0, now.getTime() - lastChangeTimestamp);

      await LeadStageHistory.create({
        leadId: lead._id,
        fromStage: prevStatus,
        toStage: newStatus,
        changedBy: session.user.id,
        changedByName: session.user.name,
        changedByEmail: session.user.email,
        changedAt: now,
        source: "DASHBOARD_CRM",
        reasonCode: lostReason || undefined,
        sanitizedNote: reason || lostExplanation || undefined,
        durationInPreviousStageMs,
      });
    } catch (err) {
      logger.error("[Lead] Failed to write LeadStageHistory", { error: err });
    }

    await logAuditEvent({
      actor: session.user,
      action: "LEAD_STATUS_CHANGED",
      targetLeadId: lead._id,
      reason: reason || `${prevStatus} → ${newStatus}${lostReason ? ` (${lostReason})` : ""}`,
      changes: [{ field: "status", from: prevStatus, to: newStatus }],
    });

    revalidateLeads(leadId);
    return { success: true, message: `Lead status updated to ${newStatus}.` };
  } catch (error) {
    logger.error("[Lead] changeLeadStatusAction failed", { error: error instanceof Error ? error.message : "Unknown" });
    return { success: false, code: "DATABASE_ERROR", message: "Failed to update status. Please try again." };
  }
}

/**
 * Change lead priority. Any authenticated active staff can change priority.
 */
export async function changeLeadPriorityAction(
  leadId: string,
  newPriority: LeadPriority,
  expectedVersion: number
): Promise<ActionResult> {
  try {
    const session = await requireAdminSession();
    await connectToDatabase();

    const lead = await requireLead(leadId, session.user.role, session.user.id);
    if (!lead) return { success: false, code: "NOT_FOUND", message: "Lead not found or access denied." };
    if (lead.__v !== expectedVersion) return { success: false, code: "CONFLICT", message: "This lead was updated by another user. Please refresh and try again." };
    if (lead.archivedAt) return { success: false, code: "ALREADY_ARCHIVED", message: "Archived leads cannot be modified." };

    const prevPriority = lead.priority;
    lead.priority = newPriority;

    lead.timeline.push({
      eventType: "PRIORITY_CHANGED",
      actorType: "ADMIN_USER",
      actorId: session.user.id,
      actorEmail: session.user.email,
      actorName: session.user.name,
      summary: `Priority changed from ${prevPriority} to ${newPriority}`,
      occurredAt: new Date(),
    });

    await lead.save();

    await logAuditEvent({
      actor: session.user,
      action: "LEAD_PRIORITY_CHANGED",
      targetLeadId: lead._id,
      changes: [{ field: "priority", from: prevPriority, to: newPriority }],
    });

    revalidateLeads(leadId);
    return { success: true, message: `Priority updated to ${newPriority}.` };
  } catch (error) {
    logger.error("[Lead] changeLeadPriorityAction failed", { error: error instanceof Error ? error.message : "Unknown" });
    return { success: false, code: "DATABASE_ERROR", message: "Failed to update priority." };
  }
}

/**
 * Add an internal note to a lead. Notes are append-only and never public.
 */
export async function addLeadNoteAction(
  leadId: string,
  body: string,
  expectedVersion: number
): Promise<ActionResult> {
  try {
    const session = await requireAdminSession();
    await connectToDatabase();

    const trimmedBody = body?.trim();
    if (!trimmedBody || trimmedBody.length < 2) {
      return { success: false, code: "VALIDATION_ERROR", message: "Note must be at least 2 characters.", fieldErrors: { body: ["Required"] } };
    }
    if (trimmedBody.length > 5000) {
      return { success: false, code: "VALIDATION_ERROR", message: "Note must not exceed 5000 characters.", fieldErrors: { body: ["Too long"] } };
    }

    // Strip any executable HTML tags — notes are plain text only
    const sanitizedBody = trimmedBody.replace(/<[^>]+>/g, "").trim();

    const lead = await requireLead(leadId, session.user.role, session.user.id);
    if (!lead) return { success: false, code: "NOT_FOUND", message: "Lead not found or access denied." };
    if (lead.__v !== expectedVersion) return { success: false, code: "CONFLICT", message: "This lead was updated by another user. Please refresh and try again." };

    const now = new Date();
    lead.notes.push({
      body: sanitizedBody,
      authorId: session.user.id,
      authorEmail: session.user.email,
      authorName: session.user.name,
      createdAt: now,
    });

    lead.timeline.push({
      eventType: "NOTE_ADDED",
      actorType: "ADMIN_USER",
      actorId: session.user.id,
      actorEmail: session.user.email,
      actorName: session.user.name,
      summary: `Internal note added by ${session.user.name}`,
      occurredAt: now,
    });

    await lead.save();

    await logAuditEvent({
      actor: session.user,
      action: "LEAD_NOTE_ADDED",
      targetLeadId: lead._id,
    });

    revalidateLeads(leadId);
    return { success: true, message: "Note added." };
  } catch (error) {
    logger.error("[Lead] addLeadNoteAction failed", { error: error instanceof Error ? error.message : "Unknown" });
    return { success: false, code: "DATABASE_ERROR", message: "Failed to add note." };
  }
}

/**
 * Record a manual contact attempt. Does not initiate any calls/emails/WhatsApp.
 */
export async function recordContactAttemptAction(
  leadId: string,
  type: ContactAttemptType,
  outcome: ContactAttemptOutcome,
  note?: string,
  nextFollowUpAt?: string
): Promise<ActionResult> {
  try {
    const session = await requireAdminSession();
    await connectToDatabase();

    const lead = await requireLead(leadId, session.user.role, session.user.id);
    if (!lead) return { success: false, code: "NOT_FOUND", message: "Lead not found or access denied." };
    if (lead.archivedAt) return { success: false, code: "ALREADY_ARCHIVED", message: "Archived leads cannot be modified." };

    const now = new Date();
    const followUp = nextFollowUpAt ? new Date(nextFollowUpAt) : undefined;

    if (followUp && followUp <= now) {
      return { success: false, code: "VALIDATION_ERROR", message: "Follow-up date must be in the future.", fieldErrors: { nextFollowUpAt: ["Must be in the future"] } };
    }

    lead.contactAttempts.push({
      type,
      outcome,
      note: note?.trim().slice(0, 2000),
      actorId: session.user.id,
      actorEmail: session.user.email,
      actorName: session.user.name,
      nextFollowUpAt: followUp,
      occurredAt: now,
    });

    lead.lastContactedAt = now;
    if (followUp) lead.nextFollowUpAt = followUp;

    lead.timeline.push({
      eventType: "CONTACT_ATTEMPTED",
      actorType: "ADMIN_USER",
      actorId: session.user.id,
      actorEmail: session.user.email,
      actorName: session.user.name,
      summary: `${type.replace(/_/g, " ").toLowerCase()} — outcome: ${outcome.replace(/_/g, " ").toLowerCase()}`,
      occurredAt: now,
    });

    await lead.save();

    await logAuditEvent({
      actor: session.user,
      action: "LEAD_CONTACT_RECORDED",
      targetLeadId: lead._id,
      reason: `${type}: ${outcome}`,
    });

    revalidateLeads(leadId);
    return { success: true, message: "Contact attempt recorded." };
  } catch (error) {
    logger.error("[Lead] recordContactAttemptAction failed", { error: error instanceof Error ? error.message : "Unknown" });
    return { success: false, code: "DATABASE_ERROR", message: "Failed to record contact." };
  }
}

/**
 * Schedule a follow-up date and time (stored as UTC, displayed in IST).
 */
export async function scheduleLeadFollowUpAction(
  leadId: string,
  scheduledAt: string,
  note?: string
): Promise<ActionResult> {
  try {
    const session = await requireAdminSession();
    await connectToDatabase();

    const followUpDate = new Date(scheduledAt);
    if (isNaN(followUpDate.getTime())) {
      return { success: false, code: "VALIDATION_ERROR", message: "Invalid follow-up date.", fieldErrors: { scheduledAt: ["Invalid date"] } };
    }
    if (followUpDate <= new Date()) {
      return { success: false, code: "VALIDATION_ERROR", message: "Follow-up date must be in the future.", fieldErrors: { scheduledAt: ["Must be in the future"] } };
    }

    const lead = await requireLead(leadId, session.user.role, session.user.id);
    if (!lead) return { success: false, code: "NOT_FOUND", message: "Lead not found or access denied." };
    if (lead.archivedAt) return { success: false, code: "ALREADY_ARCHIVED", message: "Archived leads cannot be modified." };

    lead.nextFollowUpAt = followUpDate;

    lead.timeline.push({
      eventType: "FOLLOWUP_SCHEDULED",
      actorType: "ADMIN_USER",
      actorId: session.user.id,
      actorEmail: session.user.email,
      actorName: session.user.name,
      summary: `Follow-up scheduled for ${followUpDate.toISOString()}${note ? `: ${note}` : ""}`,
      occurredAt: new Date(),
    });

    await lead.save();

    await logAuditEvent({
      actor: session.user,
      action: "LEAD_FOLLOWUP_SCHEDULED",
      targetLeadId: lead._id,
      reason: `Scheduled: ${followUpDate.toISOString()}`,
    });

    revalidateLeads(leadId);
    return { success: true, message: "Follow-up scheduled." };
  } catch (error) {
    logger.error("[Lead] scheduleLeadFollowUpAction failed", { error: error instanceof Error ? error.message : "Unknown" });
    return { success: false, code: "DATABASE_ERROR", message: "Failed to schedule follow-up." };
  }
}

/**
 * Mark the current follow-up as completed and clear the nextFollowUpAt date.
 */
export async function completeLeadFollowUpAction(
  leadId: string,
  outcome: string,
  note?: string
): Promise<ActionResult> {
  try {
    const session = await requireAdminSession();
    await connectToDatabase();

    const lead = await requireLead(leadId, session.user.role, session.user.id);
    if (!lead) return { success: false, code: "NOT_FOUND", message: "Lead not found or access denied." };
    if (!lead.nextFollowUpAt) return { success: false, code: "VALIDATION_ERROR", message: "No follow-up is scheduled for this lead." };

    const now = new Date();
    lead.nextFollowUpAt = undefined;
    lead.lastContactedAt = now;

    lead.timeline.push({
      eventType: "FOLLOWUP_COMPLETED",
      actorType: "ADMIN_USER",
      actorId: session.user.id,
      actorEmail: session.user.email,
      actorName: session.user.name,
      summary: `Follow-up completed — ${outcome}${note ? `: ${note}` : ""}`,
      occurredAt: now,
    });

    await lead.save();

    await logAuditEvent({
      actor: session.user,
      action: "LEAD_FOLLOWUP_COMPLETED",
      targetLeadId: lead._id,
      reason: outcome,
    });

    revalidateLeads(leadId);
    return { success: true, message: "Follow-up marked as completed." };
  } catch (error) {
    logger.error("[Lead] completeLeadFollowUpAction failed", { error: error instanceof Error ? error.message : "Unknown" });
    return { success: false, code: "DATABASE_ERROR", message: "Failed to complete follow-up." };
  }
}

/**
 * Mark a lead as SPAM. Any active staff can mark spam.
 */
export async function markLeadSpamAction(
  leadId: string,
  reason: string
): Promise<ActionResult> {
  try {
    const session = await requireAdminSession();
    await connectToDatabase();

    if (!reason?.trim()) {
      return { success: false, code: "VALIDATION_ERROR", message: "A reason is required to mark a lead as spam.", fieldErrors: { reason: ["Required"] } };
    }

    const lead = await Lead.findById(leadId);
    if (!lead) return { success: false, code: "NOT_FOUND", message: "Lead not found." };
    if (lead.status === "ARCHIVED") return { success: false, code: "ALREADY_ARCHIVED", message: "Archived leads cannot be modified." };

    const now = new Date();
    lead.status = "SPAM";
    lead.abuseStatus = "CONFIRMED_SPAM";

    lead.timeline.push({
      eventType: "LEAD_MARKED_SPAM",
      actorType: "ADMIN_USER",
      actorId: session.user.id,
      actorEmail: session.user.email,
      actorName: session.user.name,
      summary: `Marked as spam: ${reason.trim()}`,
      occurredAt: now,
    });

    await lead.save();

    await logAuditEvent({
      actor: session.user,
      action: "LEAD_MARKED_SPAM",
      targetLeadId: lead._id,
      reason: reason.trim(),
    });

    revalidateLeads(leadId);
    return { success: true, message: "Lead marked as spam." };
  } catch (error) {
    logger.error("[Lead] markLeadSpamAction failed", { error: error instanceof Error ? error.message : "Unknown" });
    return { success: false, code: "DATABASE_ERROR", message: "Failed to mark lead as spam." };
  }
}

/**
 * Archive a lead. ADMIN/SUPER_ADMIN only.
 */
export async function archiveLeadAction(
  leadId: string,
  reason: string
): Promise<ActionResult> {
  try {
    const session = await requireAdminSession(["ADMIN", "SUPER_ADMIN"]);
    await connectToDatabase();

    if (!reason?.trim()) {
      return { success: false, code: "VALIDATION_ERROR", message: "A reason is required to archive a lead.", fieldErrors: { reason: ["Required"] } };
    }

    const lead = await Lead.findById(leadId);
    if (!lead) return { success: false, code: "NOT_FOUND", message: "Lead not found." };
    if (lead.archivedAt) return { success: false, code: "ALREADY_ARCHIVED", message: "This lead is already archived." };

    const now = new Date();
    lead.status = "ARCHIVED";
    lead.archivedAt = now;

    lead.timeline.push({
      eventType: "LEAD_ARCHIVED",
      actorType: "ADMIN_USER",
      actorId: session.user.id,
      actorEmail: session.user.email,
      actorName: session.user.name,
      summary: `Lead archived: ${reason.trim()}`,
      occurredAt: now,
    });

    await lead.save();

    await logAuditEvent({
      actor: session.user,
      action: "LEAD_ARCHIVED",
      targetLeadId: lead._id,
      reason: reason.trim(),
    });

    revalidateLeads(leadId);
    return { success: true, message: "Lead archived." };
  } catch (error) {
    logger.error("[Lead] archiveLeadAction failed", { error: error instanceof Error ? error.message : "Unknown" });
    return { success: false, code: "DATABASE_ERROR", message: "Failed to archive lead." };
  }
}

/**
 * Record consent withdrawal. ADMIN/SUPER_ADMIN only.
 * Marks timeline and sets consentWithdrawnAt. Does NOT auto-delete data.
 */
export async function recordConsentWithdrawalAction(
  leadId: string,
  reason: string
): Promise<ActionResult> {
  try {
    const session = await requireAdminSession(["ADMIN", "SUPER_ADMIN"]);
    await connectToDatabase();

    if (!reason?.trim()) {
      return { success: false, code: "VALIDATION_ERROR", message: "A reason is required for consent withdrawal.", fieldErrors: { reason: ["Required"] } };
    }

    const lead = await Lead.findById(leadId);
    if (!lead) return { success: false, code: "NOT_FOUND", message: "Lead not found." };
    if (lead.consentWithdrawnAt) {
      return { success: false, code: "CONFLICT", message: "Consent has already been recorded as withdrawn." };
    }

    const now = new Date();
    lead.consentWithdrawnAt = now;
    lead.consentWithdrawalReason = reason.trim();
    // Start the retention review clock immediately on withdrawal
    lead.retentionReviewAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    lead.timeline.push({
      eventType: "CONSENT_WITHDRAWN",
      actorType: "ADMIN_USER",
      actorId: session.user.id,
      actorEmail: session.user.email,
      actorName: session.user.name,
      summary: `Consent withdrawal recorded: ${reason.trim()}`,
      occurredAt: now,
    });

    await lead.save();

    await logAuditEvent({
      actor: session.user,
      action: "LEAD_CONSENT_WITHDRAWN",
      targetLeadId: lead._id,
      reason: reason.trim(),
    });

    revalidateLeads(leadId);
    return { success: true, message: "Consent withdrawal recorded. Retention review date updated." };
  } catch (error) {
    logger.error("[Lead] recordConsentWithdrawalAction failed", { error: error instanceof Error ? error.message : "Unknown" });
    return { success: false, code: "DATABASE_ERROR", message: "Failed to record consent withdrawal." };
  }
}

/**
 * Anonymize a lead — replaces PII with anonymized placeholders.
 * SUPER_ADMIN only. Supports dry-run mode.
 * Does NOT delete the record (operational stats preserved).
 *
 * Legal note: Retention rules must be reviewed by legal before production use.
 */
export async function anonymizeLeadAction(
  leadId: string,
  reason: string,
  dryRun = false
): Promise<ActionResult<{ dryRun: boolean; fieldsToAnonymize: string[] }>> {
  try {
    const session = await requireAdminSession(["SUPER_ADMIN"]);
    await connectToDatabase();

    const rl = checkRateLimit(`anonymize:${session.user.id}`, RATE_LIMITS.LEAD_ANONYMIZE.limit, RATE_LIMITS.LEAD_ANONYMIZE.windowMs);
    if (!rl.allowed) return { success: false, code: "VALIDATION_ERROR", message: "Too many anonymization requests. Please slow down." };

    if (!reason?.trim()) {
      return { success: false, code: "VALIDATION_ERROR", message: "A reason is required for anonymization.", fieldErrors: { reason: ["Required"] } };
    }

    const lead = await Lead.findById(leadId);
    if (!lead) return { success: false, code: "NOT_FOUND", message: "Lead not found." };
    if (lead.anonymizedAt) return { success: false, code: "CONFLICT", message: "This lead has already been anonymized." };

    const fieldsToAnonymize = [
      "fullName",
      "normalizedPhone",
      "displayPhone",
      "normalizedEmail",
      "displayEmail",
      "message",
      "preferredLanguage",
    ];

    if (dryRun) {
      return {
        success: true,
        message: `Dry run: ${fieldsToAnonymize.length} fields would be anonymized for lead ${leadId}.`,
        data: { dryRun: true, fieldsToAnonymize },
      };
    }

    const now = new Date();
    lead.fullName = "[ANONYMIZED]";
    lead.normalizedPhone = "[ANONYMIZED]";
    lead.displayPhone = "[ANONYMIZED]";
    lead.normalizedEmail = undefined;
    lead.displayEmail = undefined;
    lead.message = undefined;
    lead.preferredLanguage = undefined;
    lead.anonymizedAt = now;
    lead.anonymizationReason = reason.trim();

    lead.timeline.push({
      eventType: "LEAD_ANONYMIZED",
      actorType: "ADMIN_USER",
      actorId: session.user.id,
      actorEmail: session.user.email,
      actorName: session.user.name,
      summary: `Lead anonymized: ${reason.trim()}`,
      occurredAt: now,
    });

    await lead.save();

    await logAuditEvent({
      actor: session.user,
      action: "LEAD_ANONYMIZED",
      targetLeadId: lead._id,
      reason: reason.trim(),
    });

    revalidateLeads(leadId);
    return {
      success: true,
      message: "Lead successfully anonymized.",
      data: { dryRun: false, fieldsToAnonymize },
    };
  } catch (error) {
    logger.error("[Lead] anonymizeLeadAction failed", { error: error instanceof Error ? error.message : "Unknown" });
    return { success: false, code: "DATABASE_ERROR", message: "Failed to anonymize lead." };
  }
}

/**
 * Update lead investment requirements (Preferred location, budget, property category, timeline, purpose)
 */
export async function updateLeadRequirementsAction(
  leadId: string,
  data: {
    preferredLocation?: string;
    propertyTypeInterest?: string;
    budgetRange?: string;
    budgetMinimumPaise?: number;
    budgetMaximumPaise?: number;
    purchaseTimeline?: string;
    investmentPurpose?: string;
  },
  expectedVersion: number
): Promise<ActionResult> {
  try {
    const session = await requireAdminSession();
    await connectToDatabase();

    const lead = await requireLead(leadId, session.user.role, session.user.id);
    if (!lead) return { success: false, code: "NOT_FOUND", message: "Lead not found or access denied." };
    if (lead.__v !== expectedVersion) {
      return { success: false, code: "CONFLICT", message: "Lead was updated by another user. Please refresh and try again." };
    }
    if (lead.archivedAt) return { success: false, code: "ALREADY_ARCHIVED", message: "Archived leads cannot be modified." };

    if (data.preferredLocation !== undefined) lead.preferredLocation = data.preferredLocation.trim() || undefined;
    if (data.propertyTypeInterest !== undefined) lead.propertyTypeInterest = data.propertyTypeInterest.trim() || undefined;
    if (data.budgetRange !== undefined) lead.budgetRange = data.budgetRange.trim() || undefined;
    if (data.budgetMinimumPaise !== undefined) lead.budgetMinimumPaise = data.budgetMinimumPaise;
    if (data.budgetMaximumPaise !== undefined) lead.budgetMaximumPaise = data.budgetMaximumPaise;
    if (data.purchaseTimeline !== undefined) lead.purchaseTimeline = (data.purchaseTimeline as any) || undefined;
    if (data.investmentPurpose !== undefined) lead.investmentPurpose = (data.investmentPurpose as any) || undefined;

    const now = new Date();
    lead.timeline.push({
      eventType: "LEAD_REQUIREMENTS_UPDATED",
      actorType: "ADMIN_USER",
      actorId: session.user.id,
      actorEmail: session.user.email,
      actorName: session.user.name,
      summary: `Advisory requirements updated: ${[
        data.preferredLocation ? `Location: ${data.preferredLocation}` : null,
        data.propertyTypeInterest ? `Type: ${data.propertyTypeInterest}` : null,
        data.budgetRange ? `Budget: ${data.budgetRange}` : null,
      ].filter(Boolean).join(", ") || "Details refreshed"}`,
      occurredAt: now,
    });

    await lead.save();

    await logAuditEvent({
      actor: session.user,
      action: "LEAD_STATUS_CHANGED" as any,
      targetLeadId: lead._id,
      reason: "Updated investment requirements and budget parameters",
    });

    revalidateLeads(leadId);
    return { success: true, message: "Lead requirements updated successfully." };
  } catch (error) {
    logger.error("[Lead] updateLeadRequirementsAction failed", { error: error instanceof Error ? error.message : "Unknown" });
    return { success: false, code: "DATABASE_ERROR", message: "Failed to update lead requirements." };
  }
}

