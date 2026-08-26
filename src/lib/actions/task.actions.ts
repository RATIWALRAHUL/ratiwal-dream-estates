"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongoose";
import { OperationalTask } from "@/models/OperationalTask";
import { TaskComment } from "@/models/TaskComment";
import { TaskActivity } from "@/models/TaskActivity";
import { TeamMember } from "@/models/TeamMember";
import { TaskLifecycleService } from "@/lib/services/task-lifecycle.service";
import { LeadTaskSyncService } from "@/lib/services/lead-task-sync.service";
import {
  TaskType,
  TaskPriority,
  TaskStatus,
  RelatedEntityType,
  LeadFollowUpOutcome,
} from "@/types/task";
import { logAuditEvent } from "@/lib/services/audit.service";

export interface ActionResult<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  code?: string;
}

/**
 * Creates a new manual operational task
 */
export async function createTaskAction(formData: FormData): Promise<ActionResult> {
  try {
    const session = await requireSession();
    await connectToDatabase();

    const title = (formData.get("title") as string)?.trim();
    const description = (formData.get("description") as string)?.trim();
    const taskType = formData.get("taskType") as TaskType;
    const priority = (formData.get("priority") as TaskPriority) || "NORMAL";
    const assignedUserId = formData.get("assignedUserId") as string;
    const dueAtStr = formData.get("dueAt") as string;
    const reviewerUserId = (formData.get("reviewerUserId") as string) || undefined;
    const relatedEntityType = (formData.get("relatedEntityType") as RelatedEntityType) || undefined;
    const relatedEntityId = (formData.get("relatedEntityId") as string) || undefined;

    if (!title || !taskType || !assignedUserId || !dueAtStr) {
      return { success: false, code: "VALIDATION_ERROR", message: "Title, task type, assignee, and due date are required." };
    }

    const assignedMember = await TeamMember.findById(assignedUserId);
    if (!assignedMember || assignedMember.status !== "ACTIVE") {
      return { success: false, code: "INVALID_ASSIGNEE", message: "Assigned team member must be an active user." };
    }

    let reviewerMember;
    if (reviewerUserId) {
      reviewerMember = await TeamMember.findById(reviewerUserId);
    }

    const count = await OperationalTask.countDocuments();
    const taskNumber = `RDE-TSK-${String(count + 100001).slice(1)}`;

    const task = await OperationalTask.create({
      taskNumber,
      title,
      description,
      taskType,
      source: "MANUAL",
      assignedUserId: assignedMember._id.toString(),
      assignedUserName: assignedMember.fullName,
      assignedUserEmail: assignedMember.email,
      assignedTeam: assignedMember.department,
      assignedByUserId: session.user.id,
      assignedByUserName: session.user.name,
      reviewerUserId: reviewerMember?._id.toString(),
      reviewerUserName: reviewerMember?.fullName,
      status: "TO_DO",
      priority,
      dueAt: new Date(dueAtStr),
      relatedEntityType,
      relatedEntityId: relatedEntityId ? relatedEntityId : undefined,
      createdBy: session.user.id,
      createdByName: session.user.name,
      version: 1,
    });

    await TaskActivity.create({
      taskId: task._id,
      activityType: "CREATED",
      toStatus: "TO_DO",
      actorId: session.user.id,
      actorName: session.user.name,
      actorEmail: session.user.email,
      actorRole: session.user.role,
      comment: "Task created manually",
      taskVersion: 1,
    });

    await logAuditEvent({
      actor: { id: session.user.id, role: session.user.role, email: session.user.email, name: session.user.name },
      action: "TASK_CREATED",
      targetTaskId: task._id,
      reason: `Manual task created: ${task.title}`,
    });

    revalidatePath("/dashboard/my-work");
    revalidatePath("/dashboard/tasks");
    return { success: true, message: "Task created successfully.", data: { taskId: task._id.toString(), taskNumber } };
  } catch (error: any) {
    return { success: false, code: "SERVER_ERROR", message: error.message || "Failed to create task." };
  }
}

/**
 * Transitions task status
 */
export async function updateTaskStatusAction(taskId: string, newStatus: TaskStatus, reason?: string): Promise<ActionResult> {
  try {
    const session = await requireSession();
    await TaskLifecycleService.transitionStatus({
      taskId,
      newStatus,
      reason,
      actorId: session.user.id,
      actorName: session.user.name,
      actorEmail: session.user.email,
      actorRole: session.user.role,
    });

    revalidatePath("/dashboard/my-work");
    revalidatePath("/dashboard/tasks");
    revalidatePath(`/dashboard/tasks/${taskId}`);
    return { success: true, message: `Task status updated to ${newStatus}.` };
  } catch (error: any) {
    return { success: false, code: "TRANSITION_ERROR", message: error.message || "Failed to update task status." };
  }
}

/**
 * Accepts a pending task
 */
export async function acceptTaskAction(taskId: string): Promise<ActionResult> {
  return updateTaskStatusAction(taskId, "TO_DO", "Task formally accepted by assignee.");
}

/**
 * Starts work on a task
 */
export async function startTaskAction(taskId: string): Promise<ActionResult> {
  return updateTaskStatusAction(taskId, "IN_PROGRESS", "Task work initiated.");
}

/**
 * Submits task for review
 */
export async function submitTaskForReviewAction(taskId: string, notes?: string): Promise<ActionResult> {
  return updateTaskStatusAction(taskId, "IN_REVIEW", notes || "Submitted for managerial review.");
}

/**
 * Approves a reviewed task
 */
export async function approveTaskAction(taskId: string, approvalNotes?: string): Promise<ActionResult> {
  return updateTaskStatusAction(taskId, "COMPLETED", approvalNotes || "Review approved.");
}

/**
 * Returns a task for revisions
 */
export async function returnTaskForChangesAction(taskId: string, reason: string): Promise<ActionResult> {
  if (!reason?.trim()) {
    return { success: false, code: "REASON_REQUIRED", message: "A specific return reason is required." };
  }
  return updateTaskStatusAction(taskId, "IN_PROGRESS", `Returned for revisions: ${reason.trim()}`);
}

/**
 * Reassigns task to another team member
 */
export async function reassignTaskAction(taskId: string, newAssigneeId: string, reason: string): Promise<ActionResult> {
  try {
    const session = await requireSession();
    await TaskLifecycleService.reassignTask({
      taskId,
      newAssigneeId,
      reason,
      actorId: session.user.id,
      actorName: session.user.name,
      actorEmail: session.user.email,
      actorRole: session.user.role,
    });

    revalidatePath("/dashboard/my-work");
    revalidatePath("/dashboard/tasks");
    revalidatePath(`/dashboard/tasks/${taskId}`);
    return { success: true, message: "Task reassigned successfully." };
  } catch (error: any) {
    return { success: false, code: "REASSIGN_ERROR", message: error.message || "Failed to reassign task." };
  }
}

/**
 * Completes a lead follow-up with structured outcome
 */
export async function completeLeadFollowUpAction(
  leadId: string,
  taskId: string | undefined,
  outcome: LeadFollowUpOutcome,
  notes: string,
  nextFollowUpAtStr?: string
): Promise<ActionResult> {
  try {
    const session = await requireSession();
    const nextDate = nextFollowUpAtStr ? new Date(nextFollowUpAtStr) : undefined;

    await LeadTaskSyncService.completeFollowUp({
      leadId,
      taskId,
      outcome,
      notes,
      nextFollowUpAt: nextDate,
      actorId: session.user.id,
      actorName: session.user.name,
      actorEmail: session.user.email,
    });

    revalidatePath("/dashboard/my-work");
    revalidatePath("/dashboard/leads");
    revalidatePath(`/dashboard/leads/${leadId}`);
    return { success: true, message: "Follow-up recorded successfully." };
  } catch (error: any) {
    return { success: false, code: "FOLLOW_UP_ERROR", message: error.message || "Failed to complete follow-up." };
  }
}

/**
 * Adds an internal comment to a task
 */
export async function addTaskCommentAction(taskId: string, content: string, visibility: any = "INTERNAL"): Promise<ActionResult> {
  try {
    const session = await requireSession();
    await connectToDatabase();

    if (!content?.trim()) {
      return { success: false, code: "VALIDATION_ERROR", message: "Comment content cannot be empty." };
    }

    const comment = await TaskComment.create({
      taskId,
      authorId: session.user.id,
      authorName: session.user.name,
      authorRole: session.user.role,
      content: content.trim(),
      visibility,
    });

    await TaskActivity.create({
      taskId,
      activityType: "COMMENT_ADDED",
      actorId: session.user.id,
      actorName: session.user.name,
      actorEmail: session.user.email,
      actorRole: session.user.role,
      comment: "Added a task comment",
      taskVersion: 1,
    });

    revalidatePath(`/dashboard/tasks/${taskId}`);
    return { success: true, message: "Comment added.", data: { commentId: comment._id.toString() } };
  } catch (error: any) {
    return { success: false, code: "COMMENT_ERROR", message: error.message || "Failed to add comment." };
  }
}

/**
 * Bulk updates multiple tasks (e.g. bulk complete, bulk priority change)
 */
export async function bulkUpdateTasksAction(taskIds: string[], update: { status?: TaskStatus; priority?: TaskPriority; reason?: string }): Promise<ActionResult> {
  try {
    const session = await requireSession();
    await connectToDatabase();

    if (!taskIds || taskIds.length === 0) {
      return { success: false, code: "VALIDATION_ERROR", message: "No tasks selected." };
    }

    let updatedCount = 0;
    for (const taskId of taskIds) {
      if (update.status) {
        await TaskLifecycleService.transitionStatus({
          taskId,
          newStatus: update.status,
          reason: update.reason || "Bulk status update",
          actorId: session.user.id,
          actorName: session.user.name,
          actorEmail: session.user.email,
          actorRole: session.user.role,
        });
        updatedCount++;
      } else if (update.priority) {
        const task = await OperationalTask.findById(taskId);
        if (task) {
          task.priority = update.priority;
          task.version += 1;
          await task.save();
          updatedCount++;
        }
      }
    }

    revalidatePath("/dashboard/my-work");
    revalidatePath("/dashboard/tasks");
    return { success: true, message: `Successfully updated ${updatedCount} tasks.` };
  } catch (error: any) {
    return { success: false, code: "BULK_ERROR", message: error.message || "Failed to perform bulk update." };
  }
}
