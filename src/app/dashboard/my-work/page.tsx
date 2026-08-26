import "server-only";

import { Suspense } from "react";
import { requireSession } from "@/lib/auth/session";
import { TaskQueryService } from "@/lib/services/task-query.service";
import { TeamMember } from "@/models/TeamMember";
import { MyWorkView } from "@/components/dashboard/tasks/MyWorkView";
import { MyWorkSkeleton } from "@/components/dashboard/tasks/TaskSkeletons";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Work Queue | Admin Dashboard",
  description: "Personal prioritized task queue, follow-ups, and review assignments.",
};

export default async function MyWorkPage(props: { searchParams?: Promise<{ tab?: string }> }) {
  const session = await requireSession();
  const searchParams = await props.searchParams;
  const tab = searchParams?.tab || "TODAY";

  const [metrics, tasks, teamMembers] = await Promise.all([
    TaskQueryService.getMyWorkMetrics(session.user.id),
    TaskQueryService.getMyWorkTasks(session.user.id, tab),
    TeamMember.find({ status: "ACTIVE" }).select("_id fullName department").lean(),
  ]);

  const teamOptions = teamMembers.map((m: any) => ({
    id: m._id.toString(),
    name: m.fullName,
    department: m.department,
  }));

  return (
    <Suspense fallback={<MyWorkSkeleton />}>
      <MyWorkView
        metrics={metrics}
        tasks={tasks}
        currentUserId={session.user.id}
        teamMembers={teamOptions}
        activeTab={tab}
      />
    </Suspense>
  );
}
