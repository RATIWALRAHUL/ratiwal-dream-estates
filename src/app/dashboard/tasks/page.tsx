import "server-only";

import { Suspense } from "react";
import { requireSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongoose";
import { OperationalTask } from "@/models/OperationalTask";
import { TeamMember } from "@/models/TeamMember";
import { TaskListView } from "@/components/dashboard/tasks/TaskListView";
import { MyWorkSkeleton } from "@/components/dashboard/tasks/TaskSkeletons";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Operational Tasks Repository | Admin Dashboard",
  description: "Unified team operational tasks, CRM follow-ups, and review queues.",
};

export default async function TasksPage() {
  const session = await requireSession();
  await connectToDatabase();
  const now = new Date();

  const [rawTasks, teamMembers] = await Promise.all([
    OperationalTask.find()
      .populate("propertyId", "title")
      .populate("locationId", "name")
      .sort({ createdAt: -1 })
      .limit(200)
      .lean(),
    TeamMember.find({ status: "ACTIVE" }).select("_id fullName department").lean(),
  ]);

  const tasks = rawTasks.map((t: any) => ({
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
    isDueToday: t.dueAt ? new Date(t.dueAt).toDateString() === now.toDateString() : false,
    startAt: t.startAt ? new Date(t.startAt).toISOString() : undefined,
    acceptedAt: t.acceptedAt ? new Date(t.acceptedAt).toISOString() : undefined,
    completedAt: t.completedAt ? new Date(t.completedAt).toISOString() : undefined,
    createdAt: t.createdAt ? new Date(t.createdAt).toISOString() : "",
    slaStatus: t.slaBreachedAt ? "BREACHED" as const : "ON_TRACK" as const,
  }));

  const teamOptions = teamMembers.map((m: any) => ({
    id: m._id.toString(),
    name: m.fullName,
    department: m.department,
  }));

  return (
    <Suspense fallback={<MyWorkSkeleton />}>
      <TaskListView
        initialTasks={tasks}
        teamMembers={teamOptions}
        currentUserId={session.user.id}
      />
    </Suspense>
  );
}
