import "server-only";

import { connectToDatabase } from "@/lib/db/mongoose";
import { OperationalTask } from "@/models/OperationalTask";
import { TaskEscalation } from "@/models/TaskEscalation";
import { TaskActivity } from "@/models/TaskActivity";
import { TeamMember } from "@/models/TeamMember";
import { CommunicationOutboxService } from "@/lib/services/communication-outbox.service";

export class TaskSlaService {
  /**
   * Evaluates tasks for SLA warnings, breaches, and escalations
   */
  public static async evaluateSlaBreaches() {
    await connectToDatabase();
    const now = new Date();

    // 1. Find overdue active tasks without breach recorded
    const overdueTasks = await OperationalTask.find({
      status: { $in: ["PENDING_ACCEPTANCE", "TO_DO", "IN_PROGRESS", "IN_REVIEW"] },
      dueAt: { $lt: now },
      slaBreachedAt: { $exists: false },
    }).limit(50);

    for (const task of overdueTasks) {
      task.slaBreachedAt = now;
      task.version += 1;
      await task.save();

      // Find department manager or admin for escalation
      const manager = await TeamMember.findOne({
        department: "SALES",
        status: "ACTIVE",
      });

      const escalatedToUserId = manager ? manager._id.toString() : "admin_system";
      const escalatedToUserName = manager ? manager.fullName : "Operations Management";

      // Create TaskEscalation record
      await TaskEscalation.create({
        taskId: task._id,
        escalationLevel: 1,
        policyVersion: task.slaPolicyVersion || "v2026.1-STANDARD-SLA",
        fromAssigneeId: task.assignedUserId,
        fromAssigneeName: task.assignedUserName,
        escalatedToUserId,
        escalatedToUserName,
        triggerReason: "SLA_BREACH",
        triggerTimestamp: now,
        status: "OPEN",
      });

      // Append activity
      await TaskActivity.create({
        taskId: task._id,
        activityType: "ESCALATED",
        actorId: "SYSTEM",
        actorName: "SLA Monitor",
        actorRole: "SYSTEM",
        comment: `Task escalated to ${escalatedToUserName} due to SLA breach (Overdue since ${task.dueAt.toISOString()})`,
        taskVersion: task.version,
      });

      // Enqueue escalation alert
      if (manager?.email) {
        await CommunicationOutboxService.enqueueEvent({
          eventType: "TASK_ESCALATED",
          aggregateType: "USER",
          aggregateId: task._id.toString(),
          recipientType: "ADMIN_POOL",
          recipientEmail: manager.email,
          recipientName: manager.fullName,
          variables: {
            taskNumber: task.taskNumber,
            taskTitle: task.title,
            assigneeName: task.assignedUserName,
            dueAt: task.dueAt.toISOString(),
          },
        });
      }
    }

    return { processedCount: overdueTasks.length };
  }
}
