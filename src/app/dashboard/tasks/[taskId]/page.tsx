import "server-only";

import { Suspense } from "react";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { TaskQueryService } from "@/lib/services/task-query.service";
import { TeamMember } from "@/models/TeamMember";
import { TaskDetailView } from "@/components/dashboard/tasks/TaskDetailView";
import { TaskDetailSkeleton } from "@/components/dashboard/tasks/TaskSkeletons";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Task Details | Admin Dashboard",
  description: "Operational task lifecycle, comments, and audit activity history.",
};

export default async function TaskDetailPage(props: { params: Promise<{ taskId: string }> }) {
  const session = await requireSession();
  const params = await props.params;

  const [taskData, teamMembers] = await Promise.all([
    TaskQueryService.getTaskDetail(params.taskId),
    TeamMember.find({ status: "ACTIVE" }).select("_id fullName department").lean(),
  ]);

  if (!taskData) {
    notFound();
  }

  const teamOptions = teamMembers.map((m: any) => ({
    id: m._id.toString(),
    name: m.fullName,
    department: m.department,
  }));

  return (
    <Suspense fallback={<TaskDetailSkeleton />}>
      <TaskDetailView
        taskData={taskData}
        teamMembers={teamOptions}
        currentUserId={session.user.id}
      />
    </Suspense>
  );
}
