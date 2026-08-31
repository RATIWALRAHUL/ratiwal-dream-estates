import "server-only";

import { connectToDatabase } from "@/lib/db/mongoose";
import { OperationalTask, IOperationalTask } from "@/models/OperationalTask";
import { TaskActivity } from "@/models/TaskActivity";
import { TeamMember } from "@/models/TeamMember";
import {
  TaskStatus,
  TaskPriority,
  isValidTaskStatusTransition,
} from "@/types/task";
import { CommunicationOutboxService } from "@/lib/services/communication-outbox.service";
import { logAuditEvent } from "@/lib/services/audit.service";

export interface TransitionTaskInput {
  taskId: string;
  newStatus: TaskStatus;
  reason?: string;
  comment?: string;
  actorId: string;
  actorName: string;
  actorEmail?: string;
  actorRole?: string;
}

export interface ReassignTaskInput {
  taskId: string;
  newAssigneeId: string;
  reason: string;
  actorId: string;
  actorName: string;
  actorEmail?: string;
  actorRole?: string;
}

export class TaskLifecycleService {
  /**
   * Transitions a task through its validated lifecycle state machine
   */
  public static async transitionStatus(input: TransitionTaskInput): Promise<IOperationalTask> {
    await connectToDatabase();

    const task = await OperationalTask.findById(input.taskId);
    if (!task) {
      throw new Error("NOT_FOUND: Operational task not found.");
    }

    const currentStatus = task.status;
    if (!isValidTaskStatusTransition(currentStatus, input.newStatus)) {
      throw new Error(
        `INVALID_TRANSITION: Cannot transition task from "${currentStatus}" to "${input.newStatus}".`
      );
    }

    // 1. Enforce review gates: Submitter cannot self-approve
    if (input.newStatus === "COMPLETED" && currentStatus === "IN_REVIEW") {
      if (task.assignedUserId === input.actorId && task.reviewerUserId && task.reviewerUserId !== input.actorId) {
        throw new Error("SEPARATION_OF_DUTIES_VIOLATION: Submitter cannot approve their own review task.");
      }
    }

    // 2. Update timestamps
    if (input.newStatus === "TO_DO" && currentStatus === "PENDING_ACCEPTANCE") {
      task.acceptedAt = new Date();
    } else if (input.newStatus === "IN_PROGRESS") {
      if (!task.startAt) task.startAt = new Date();
      if (!task.acceptedAt) task.acceptedAt = new Date();
    } else if (input.newStatus === "COMPLETED") {
      task.completedAt = new Date();
    } else if (input.newStatus === "CANCELLED") {
      task.cancelledAt = new Date();
    }

    task.status = input.newStatus;
    task.updatedBy = input.actorId;
    task.updatedByName = input.actorName;
    task.version += 1;

    await task.save();

    // 3. Record append-only TaskActivity
    await TaskActivity.create({
      taskId: task._id,
      activityType:
        input.newStatus === "TO_DO" && currentStatus === "PENDING_ACCEPTANCE"
          ? "ACCEPTED"
          : input.newStatus === "IN_PROGRESS" && currentStatus === "TO_DO"
          ? "STARTED"
          : input.newStatus === "IN_REVIEW"
          ? "SENT_TO_REVIEW"
          : input.newStatus === "COMPLETED"
          ? "COMPLETED"
          : input.newStatus === "CANCELLED"
          ? "CANCELLED"
          : "STARTED",
      fromStatus: currentStatus,
      toStatus: input.newStatus,
      actorId: input.actorId,
      actorName: input.actorName,
      actorEmail: input.actorEmail,
      actorRole: input.actorRole,
      reasonCode: input.reason,
      comment: input.comment,
      taskVersion: task.version,
    });

    // 4. Outbox notifications
    if (input.newStatus === "IN_REVIEW" && task.reviewerUserId) {
      await CommunicationOutboxService.enqueueEvent({
        eventType: "TASK_SENT_TO_REVIEW",
        aggregateType: "USER",
        aggregateId: task._id.toString(),
        recipientType: "ADMIN_POOL",
        recipientName: task.reviewerUserName || "Reviewer",
        variables: {
          taskNumber: task.taskNumber,
          taskTitle: task.title,
          submitterName: input.actorName,
        },
      });
    }

    // 5. Audit Log
    await logAuditEvent({
      actor: { id: input.actorId, role: (input.actorRole as any) || "SUPER_ADMIN", email: input.actorEmail, name: input.actorName },
      action: "TASK_STATUS_CHANGED",
      targetTaskId: task._id,
      changes: [{ field: "status", from: currentStatus, to: input.newStatus }],
      reason: input.reason || `Task status updated to ${input.newStatus}`,
    });

    return task;
  }

  /**
   * Reassigns a task to an active team member with validation
   */
  public static async reassignTask(input: ReassignTaskInput): Promise<IOperationalTask> {
    await connectToDatabase();

    const task = await OperationalTask.findById(input.taskId);
    if (!task) {
      throw new Error("NOT_FOUND: Operational task not found.");
    }

    if (!input.reason?.trim()) {
      throw new Error("REASON_REQUIRED: A valid explanation is required for task reassignment.");
    }

    // Verify target team member is active
    const targetMember = await TeamMember.findById(input.newAssigneeId);
    if (!targetMember || targetMember.status !== "ACTIVE") {
      throw new Error("INVALID_ASSIGNEE: Target team member is inactive, suspended, or archived.");
    }

    const previousAssigneeId = task.assignedUserId;
    const previousAssigneeName = task.assignedUserName;

    task.assignedUserId = targetMember._id.toString();
    task.assignedUserName = targetMember.fullName;
    task.assignedUserEmail = targetMember.email;
    task.assignedTeam = targetMember.department;
    task.assignedByUserId = input.actorId;
    task.assignedByUserName = input.actorName;
    task.status = "PENDING_ACCEPTANCE"; // Require new assignee acceptance
    task.updatedBy = input.actorId;
    task.updatedByName = input.actorName;
    task.version += 1;

    await task.save();

    // Append activity
    await TaskActivity.create({
      taskId: task._id,
      activityType: "REASSIGNED",
      fromStatus: task.status,
      toStatus: "PENDING_ACCEPTANCE",
      actorId: input.actorId,
      actorName: input.actorName,
      actorEmail: input.actorEmail,
      actorRole: input.actorRole,
      previousAssigneeId,
      previousAssigneeName,
      newAssigneeId: targetMember._id.toString(),
      newAssigneeName: targetMember.fullName,
      reasonCode: input.reason.trim(),
      taskVersion: task.version,
    });

    // Outbox notification
    await CommunicationOutboxService.enqueueEvent({
      eventType: "TASK_REASSIGNED",
      aggregateType: "USER",
      aggregateId: task._id.toString(),
      recipientType: "ADMIN_POOL",
      recipientEmail: targetMember.email,
      recipientName: targetMember.fullName,
      variables: {
        taskNumber: task.taskNumber,
        taskTitle: task.title,
        previousAssigneeName,
        assignedByName: input.actorName,
        reason: input.reason,
      },
    });

    // Audit Log
    await logAuditEvent({
      actor: { id: input.actorId, role: (input.actorRole as any) || "SUPER_ADMIN", email: input.actorEmail, name: input.actorName },
      action: "TASK_REASSIGNED",
      targetTaskId: task._id,
      changes: [
        { field: "assignedUserId", from: previousAssigneeId, to: targetMember._id.toString() },
        { field: "assignedUserName", from: previousAssigneeName, to: targetMember.fullName },
      ],
      reason: input.reason.trim(),
    });

    return task;
  }
}
