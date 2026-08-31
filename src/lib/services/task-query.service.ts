import "server-only";

import { connectToDatabase } from "@/lib/db/mongoose";
import { OperationalTask } from "@/models/OperationalTask";
import { TaskActivity } from "@/models/TaskActivity";
import { TaskComment } from "@/models/TaskComment";
import { MyWorkMetrics, TaskListItemDTO } from "@/types/task";

export class TaskQueryService {
  /**
   * Fetches the personal work queue metrics for an assigned user
   */
  public static async getMyWorkMetrics(userId: string): Promise<MyWorkMetrics> {
    await connectToDatabase();
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const weekAgo = new Date(Date.now() - 7 * 86400000);

    const [
      awaitingAcceptanceCount,
      dueTodayCount,
      overdueCount,
      inProgressCount,
      inReviewCount,
      totalActiveCount,
      completedThisWeekCount,
    ] = await Promise.all([
      OperationalTask.countDocuments({ assignedUserId: userId, status: "PENDING_ACCEPTANCE" }),
      OperationalTask.countDocuments({
        assignedUserId: userId,
        status: { $in: ["TO_DO", "IN_PROGRESS"] },
        dueAt: { $gte: todayStart, $lte: todayEnd },
      }),
      OperationalTask.countDocuments({
        assignedUserId: userId,
        status: { $in: ["PENDING_ACCEPTANCE", "TO_DO", "IN_PROGRESS"] },
        dueAt: { $lt: now },
      }),
      OperationalTask.countDocuments({ assignedUserId: userId, status: "IN_PROGRESS" }),
      OperationalTask.countDocuments({
        $or: [{ assignedUserId: userId, status: "IN_REVIEW" }, { reviewerUserId: userId, status: "IN_REVIEW" }],
      }),
      OperationalTask.countDocuments({
        assignedUserId: userId,
        status: { $in: ["PENDING_ACCEPTANCE", "TO_DO", "IN_PROGRESS", "IN_REVIEW"] },
      }),
      OperationalTask.countDocuments({
        assignedUserId: userId,
        status: "COMPLETED",
        completedAt: { $gte: weekAgo },
      }),
    ]);

    return {
      awaitingAcceptanceCount,
      dueTodayCount,
      overdueCount,
      inProgressCount,
      inReviewCount,
      totalActiveCount,
      completedThisWeekCount,
    };
  }

  /**
   * Fetches scoped personal work items for a user
   */
  public static async getMyWorkTasks(userId: string, filterTab: string = "TODAY"): Promise<TaskListItemDTO[]> {
    await connectToDatabase();
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const query: any = {};

    if (filterTab === "AWAITING_ACCEPTANCE") {
      query.assignedUserId = userId;
      query.status = "PENDING_ACCEPTANCE";
    } else if (filterTab === "OVERDUE") {
      query.assignedUserId = userId;
      query.status = { $in: ["PENDING_ACCEPTANCE", "TO_DO", "IN_PROGRESS"] };
      query.dueAt = { $lt: now };
    } else if (filterTab === "TODAY") {
      query.assignedUserId = userId;
      query.status = { $in: ["TO_DO", "IN_PROGRESS", "PENDING_ACCEPTANCE"] };
      query.dueAt = { $gte: todayStart, $lte: todayEnd };
    } else if (filterTab === "IN_PROGRESS") {
      query.assignedUserId = userId;
      query.status = "IN_PROGRESS";
    } else if (filterTab === "IN_REVIEW") {
      query.$or = [
        { assignedUserId: userId, status: "IN_REVIEW" },
        { reviewerUserId: userId, status: "IN_REVIEW" },
      ];
    } else if (filterTab === "COMPLETED") {
      query.assignedUserId = userId;
      query.status = "COMPLETED";
    } else {
      // ALL ACTIVE
      query.assignedUserId = userId;
      query.status = { $in: ["PENDING_ACCEPTANCE", "TO_DO", "IN_PROGRESS", "IN_REVIEW"] };
    }

    const tasks = await OperationalTask.find(query)
      .populate("propertyId", "title")
      .populate("locationId", "name")
      .sort({ dueAt: 1, priority: -1 })
      .limit(100)
      .lean();

    return tasks.map((t: any) => ({
      id: t._id.toString(),
      taskNumber: t.taskNumber,
      title: t.title,
      description: t.description,
      taskType: t.taskType,
      source: t.source,
      relatedEntityType: t.relatedEntityType,
      relatedEntityId: t.relatedEntityId?.toString(),
      relatedEntitySummary: t.relatedEntitySummary,
      propertyTitle: t.propertyId?.title,
      locationName: t.locationId?.name,
      assignedUserId: t.assignedUserId,
      assignedUserName: t.assignedUserName,
      assignedTeam: t.assignedTeam,
      assignedByUserName: t.assignedByUserName,
      reviewerUserName: t.reviewerUserName,
      status: t.status,
      priority: t.priority,
      dueAt: t.dueAt ? new Date(t.dueAt).toISOString() : "",
      isOverdue: t.dueAt ? new Date(t.dueAt) < now && !["COMPLETED", "CANCELLED", "ARCHIVED"].includes(t.status) : false,
      isDueToday: t.dueAt ? new Date(t.dueAt) >= todayStart && new Date(t.dueAt) <= todayEnd : false,
      startAt: t.startAt ? new Date(t.startAt).toISOString() : undefined,
      acceptedAt: t.acceptedAt ? new Date(t.acceptedAt).toISOString() : undefined,
      completedAt: t.completedAt ? new Date(t.completedAt).toISOString() : undefined,
      createdAt: t.createdAt ? new Date(t.createdAt).toISOString() : "",
      slaStatus: t.slaBreachedAt ? "BREACHED" : t.dueAt && new Date(t.dueAt) < now ? "BREACHED" : "ON_TRACK",
    }));
  }

  /**
   * Fetches full task detail with activity and comments
   */
  public static async getTaskDetail(taskId: string) {
    await connectToDatabase();

    const task = await OperationalTask.findById(taskId)
      .populate("propertyId", "title slug")
      .populate("locationId", "name slug")
      .lean();

    if (!task) return null;

    const [activities, comments] = await Promise.all([
      TaskActivity.find({ taskId: task._id }).sort({ createdAt: -1 }).limit(50).lean(),
      TaskComment.find({ taskId: task._id }).sort({ createdAt: 1 }).limit(100).lean(),
    ]);

    return {
      task: {
        ...task,
        _id: task._id.toString(),
        propertyId: task.propertyId ? { ...task.propertyId, _id: (task.propertyId as any)._id.toString() } : undefined,
        locationId: task.locationId ? { ...task.locationId, _id: (task.locationId as any)._id.toString() } : undefined,
        dueAt: task.dueAt?.toISOString(),
        startAt: task.startAt?.toISOString(),
        acceptedAt: task.acceptedAt?.toISOString(),
        completedAt: task.completedAt?.toISOString(),
        createdAt: task.createdAt?.toISOString(),
      },
      activities: activities.map((a: any) => ({
        ...a,
        _id: a._id.toString(),
        taskId: a.taskId.toString(),
        createdAt: a.createdAt?.toISOString(),
      })),
      comments: comments.map((c: any) => ({
        ...c,
        _id: c._id.toString(),
        taskId: c.taskId.toString(),
        createdAt: c.createdAt?.toISOString(),
      })),
    };
  }

  /**
   * Fetches bounded calendar tasks
   */
  public static async getCalendarTasks(startDate: Date, endDate: Date, assignedUserId?: string) {
    await connectToDatabase();

    const query: any = {
      dueAt: { $gte: startDate, $lte: endDate },
    };

    if (assignedUserId) {
      query.assignedUserId = assignedUserId;
    }

    const tasks = await OperationalTask.find(query)
      .select("taskNumber title taskType status priority dueAt assignedUserName assignedTeam")
      .sort({ dueAt: 1 })
      .lean();

    return tasks.map((t: any) => ({
      id: t._id.toString(),
      taskNumber: t.taskNumber,
      title: t.title,
      taskType: t.taskType,
      status: t.status,
      priority: t.priority,
      dueAt: t.dueAt.toISOString(),
      assignedUserName: t.assignedUserName,
      assignedTeam: t.assignedTeam,
    }));
  }
}
