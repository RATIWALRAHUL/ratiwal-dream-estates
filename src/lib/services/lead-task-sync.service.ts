import "server-only";

import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Lead } from "@/models/Lead";
import { OperationalTask, IOperationalTask } from "@/models/OperationalTask";
import { TaskActivity } from "@/models/TaskActivity";
import { LeadFollowUpOutcome } from "@/types/task";
import { TaskGeneratorService } from "./task-generator.service";
import { logAuditEvent } from "./audit.service";

export interface ScheduleLeadFollowUpInput {
  leadId: string;
  dueAt: Date;
  notes?: string;
  actorId: string;
  actorName: string;
  actorEmail?: string;
}

export interface CompleteLeadFollowUpInput {
  leadId: string;
  taskId?: string;
  outcome: LeadFollowUpOutcome;
  notes: string;
  nextFollowUpAt?: Date;
  actorId: string;
  actorName: string;
  actorEmail?: string;
}

export class LeadTaskSyncService {
  /**
   * Schedules a follow-up on a lead and creates/synchronizes the operational task
   */
  public static async scheduleFollowUp(input: ScheduleLeadFollowUpInput) {
    await connectToDatabase();

    const lead = await Lead.findById(input.leadId);
    if (!lead) {
      throw new Error("NOT_FOUND: Lead not found.");
    }

    if (["WON", "LOST", "SPAM", "ARCHIVED"].includes(lead.status)) {
      throw new Error("INVALID_STATE: Cannot schedule follow-up on closed/archived lead.");
    }

    // 1. Update Lead date
    lead.nextFollowUpAt = input.dueAt;
    await lead.save();

    // 2. Cancel prior pending follow-up tasks for this lead
    await OperationalTask.updateMany(
      {
        relatedEntityType: "LEAD",
        relatedEntityId: lead._id,
        taskType: "LEAD_FOLLOW_UP",
        status: { $in: ["PENDING_ACCEPTANCE", "TO_DO", "IN_PROGRESS"] },
      },
      { $set: { status: "CANCELLED", cancelledAt: new Date() } }
    );

    // 3. Create new synchronized task
    const idempotencyKey = `lead_followup_${lead._id}_${input.dueAt.getTime()}`;
    const task = await TaskGeneratorService.generateSystemTask({
      taskType: "LEAD_FOLLOW_UP",
      title: `Follow up with ${lead.fullName}`,
      description: input.notes || `Scheduled CRM follow-up with buyer: ${lead.displayPhone}`,
      sourceEvent: "LEAD_FOLLOW_UP_SCHEDULED",
      relatedEntityType: "LEAD",
      relatedEntityId: lead._id,
      relatedEntitySummary: `${lead.fullName} (${lead.displayPhone})`,
      propertyId: lead.propertyId,
      locationId: lead.locationId,
      assignedUserId: lead.assignedToId || input.actorId,
      assignedUserName: lead.assignedToName || input.actorName,
      assignedUserEmail: lead.assignedToEmail || input.actorEmail,
      priority: lead.priority === "URGENT" ? "URGENT" : lead.priority === "HIGH" ? "HIGH" : "NORMAL",
      dueAt: input.dueAt,
      idempotencyKey,
    });

    return { lead, task };
  }

  /**
   * Completes a lead follow-up task with mandatory structured outcome
   */
  public static async completeFollowUp(input: CompleteLeadFollowUpInput) {
    await connectToDatabase();

    const lead = await Lead.findById(input.leadId);
    if (!lead) {
      throw new Error("NOT_FOUND: Lead not found.");
    }

    if (!input.outcome) {
      throw new Error("OUTCOME_REQUIRED: A structured follow-up outcome must be recorded.");
    }

    // 1. Complete associated operational task
    let task: IOperationalTask | null = null;
    if (input.taskId) {
      task = await OperationalTask.findById(input.taskId);
    } else {
      task = await OperationalTask.findOne({
        relatedEntityType: "LEAD",
        relatedEntityId: lead._id,
        taskType: "LEAD_FOLLOW_UP",
        status: { $in: ["TO_DO", "IN_PROGRESS", "PENDING_ACCEPTANCE"] },
      });
    }

    if (task) {
      const prevStatus = task.status;
      task.status = "COMPLETED";
      task.completedAt = new Date();
      task.updatedBy = input.actorId;
      task.updatedByName = input.actorName;
      task.version += 1;
      await task.save();

      await TaskActivity.create({
        taskId: task._id,
        activityType: "COMPLETED",
        fromStatus: prevStatus,
        toStatus: "COMPLETED",
        actorId: input.actorId,
        actorName: input.actorName,
        actorEmail: input.actorEmail,
        comment: `Outcome: ${input.outcome}. Notes: ${input.notes}`,
        taskVersion: task.version,
      });
    }

    // 2. Append CRM note / timeline to lead
    lead.notes = lead.notes || [];
    lead.notes.push({
      id: new Types.ObjectId().toString(),
      body: `[Follow-up Outcome: ${input.outcome}] ${input.notes}`,
      authorName: input.actorName,
      authorEmail: input.actorEmail || "advisor@ratiwaldreamestates.com",
      createdAt: new Date(),
    } as any);

    lead.lastContactedAt = new Date();

    // 3. If next follow-up date provided, schedule next; else clear nextFollowUpAt
    if (input.nextFollowUpAt) {
      lead.nextFollowUpAt = input.nextFollowUpAt;
      await lead.save();

      await this.scheduleFollowUp({
        leadId: lead._id.toString(),
        dueAt: input.nextFollowUpAt,
        notes: `Follow-up from previous outcome (${input.outcome})`,
        actorId: input.actorId,
        actorName: input.actorName,
        actorEmail: input.actorEmail,
      });
    } else {
      lead.nextFollowUpAt = undefined;
      await lead.save();
    }

    await logAuditEvent({
      actor: { id: input.actorId, role: "SUPER_ADMIN", email: input.actorEmail, name: input.actorName, isActive: true },
      action: "TASK_COMPLETED",
      targetLeadId: lead._id,
      targetTaskId: task?._id,
      reason: `Lead follow-up completed: ${input.outcome}`,
    });

    return { lead, task };
  }
}
