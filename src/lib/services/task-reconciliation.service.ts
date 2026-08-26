import "server-only";

import { connectToDatabase } from "@/lib/db/mongoose";
import { OperationalTask } from "@/models/OperationalTask";
import { Lead } from "@/models/Lead";
import { TaskSlaService } from "./task-sla.service";
import { logAuditEvent } from "./audit.service";

export interface ReconciliationReport {
  timestamp: string;
  totalActiveTasks: number;
  orphanedTasksCount: number;
  duplicateIdempotencyConflicts: number;
  mismatchedLeadDatesCount: number;
  slaBreachesProcessed: number;
}

export class TaskReconciliationService {
  /**
   * Runs an idempotent diagnostic & reconciliation pass across active tasks
   */
  public static async runReconciliation(): Promise<ReconciliationReport> {
    await connectToDatabase();
    const now = new Date();

    const [totalActiveTasks, activeTasks] = await Promise.all([
      OperationalTask.countDocuments({ status: { $in: ["PENDING_ACCEPTANCE", "TO_DO", "IN_PROGRESS", "IN_REVIEW"] } }),
      OperationalTask.find({ status: { $in: ["PENDING_ACCEPTANCE", "TO_DO", "IN_PROGRESS", "IN_REVIEW"] } })
        .select("_id relatedEntityType relatedEntityId dueAt idempotencyKey taskType")
        .limit(500)
        .lean(),
    ]);

    let orphanedTasksCount = 0;
    let mismatchedLeadDatesCount = 0;
    const seenKeys = new Set<string>();
    let duplicateIdempotencyConflicts = 0;

    for (const task of activeTasks) {
      if (task.idempotencyKey) {
        if (seenKeys.has(task.idempotencyKey)) {
          duplicateIdempotencyConflicts++;
        } else {
          seenKeys.add(task.idempotencyKey);
        }
      }

      if (task.relatedEntityType === "LEAD" && task.relatedEntityId) {
        const lead = await Lead.findById(task.relatedEntityId).select("nextFollowUpAt status").lean();
        if (!lead) {
          orphanedTasksCount++;
        } else if (
          task.taskType === "LEAD_FOLLOW_UP" &&
          lead.nextFollowUpAt &&
          Math.abs(new Date(lead.nextFollowUpAt).getTime() - new Date(task.dueAt).getTime()) > 60000
        ) {
          mismatchedLeadDatesCount++;
        }
      }
    }

    // Run SLA breach evaluation
    const slaResult = await TaskSlaService.evaluateSlaBreaches();

    const report: ReconciliationReport = {
      timestamp: now.toISOString(),
      totalActiveTasks,
      orphanedTasksCount,
      duplicateIdempotencyConflicts,
      mismatchedLeadDatesCount,
      slaBreachesProcessed: slaResult.processedCount,
    };

    await logAuditEvent({
      actor: { id: "system", role: "SYSTEM", email: "system@ratiwaldreamestates.com", name: "Task Reconciliation Service", isActive: true },
      action: "TASK_RECONCILIATION_RUN",
      reason: `Reconciliation pass completed. Active: ${totalActiveTasks}, SLA breaches: ${slaResult.processedCount}`,
    });

    return report;
  }
}
