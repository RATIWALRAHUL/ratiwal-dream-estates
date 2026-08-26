import "server-only";

import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { OperationalTask, IOperationalTask } from "@/models/OperationalTask";
import { TaskActivity } from "@/models/TaskActivity";
import {
  TaskType,
  TaskPriority,
  RelatedEntityType,
} from "@/types/task";
import { CommunicationOutboxService } from "@/lib/services/communication-outbox.service";

export interface GenerateSystemTaskInput {
  taskType: TaskType;
  title: string;
  description?: string;
  sourceEvent: string;
  relatedEntityType: RelatedEntityType;
  relatedEntityId: string | Types.ObjectId;
  relatedEntitySummary?: string;
  propertyId?: string | Types.ObjectId;
  locationId?: string | Types.ObjectId;
  assignedUserId: string;
  assignedUserName: string;
  assignedUserEmail?: string;
  assignedTeam?: string;
  assignedByUserId?: string;
  assignedByUserName?: string;
  reviewerUserId?: string;
  reviewerUserName?: string;
  priority?: TaskPriority;
  dueAt: Date;
  idempotencyKey: string;
}

export class TaskGeneratorService {
  /**
   * Generates a deterministic system task if not already present
   */
  public static async generateSystemTask(input: GenerateSystemTaskInput): Promise<IOperationalTask> {
    await connectToDatabase();

    // Check if task already exists with this idempotency key
    let task = await OperationalTask.findOne({ idempotencyKey: input.idempotencyKey });
    if (task) {
      return task; // Idempotent return, zero duplicates
    }

    const count = await OperationalTask.countDocuments();
    const taskNumber = `RDE-TSK-${String(count + 100001).slice(1)}`;

    task = await OperationalTask.create({
      taskNumber,
      title: input.title.trim(),
      description: input.description?.trim(),
      taskType: input.taskType,
      source: "SYSTEM_GENERATED",
      sourceEvent: input.sourceEvent,
      relatedEntityType: input.relatedEntityType,
      relatedEntityId: new Types.ObjectId(input.relatedEntityId),
      relatedEntitySummary: input.relatedEntitySummary,
      propertyId: input.propertyId ? new Types.ObjectId(input.propertyId) : undefined,
      locationId: input.locationId ? new Types.ObjectId(input.locationId) : undefined,
      assignedUserId: input.assignedUserId,
      assignedUserName: input.assignedUserName,
      assignedUserEmail: input.assignedUserEmail,
      assignedTeam: input.assignedTeam,
      assignedByUserId: input.assignedByUserId || "SYSTEM",
      assignedByUserName: input.assignedByUserName || "Ratiwal System Automation",
      reviewerUserId: input.reviewerUserId,
      reviewerUserName: input.reviewerUserName,
      status: "TO_DO",
      priority: input.priority || "NORMAL",
      dueAt: input.dueAt,
      idempotencyKey: input.idempotencyKey,
      createdBy: "SYSTEM",
      createdByName: "Ratiwal Operational Engine",
      version: 1,
    });

    // Activity Log
    await TaskActivity.create({
      taskId: task._id,
      activityType: "CREATED",
      toStatus: "TO_DO",
      actorId: "SYSTEM",
      actorName: "System Automation",
      actorRole: "SYSTEM",
      comment: `Task automatically generated from event "${input.sourceEvent}"`,
      relatedBusinessEventRef: input.sourceEvent,
      taskVersion: 1,
    });

    // Outbox notification
    if (input.assignedUserEmail) {
      await CommunicationOutboxService.enqueueEvent({
        eventType: "TASK_ASSIGNED",
        aggregateType: "USER",
        aggregateId: task._id.toString(),
        recipientType: "ADMIN_POOL",
        recipientEmail: input.assignedUserEmail,
        recipientName: input.assignedUserName,
        variables: {
          taskNumber,
          taskTitle: task.title,
          assignedByName: "System Automation",
          dueAt: input.dueAt.toISOString(),
        },
      });
    }

    return task;
  }
}
