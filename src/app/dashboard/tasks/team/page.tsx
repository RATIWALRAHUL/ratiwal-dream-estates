import "server-only";

import { Suspense } from "react";
import { requireSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongoose";
import { OperationalTask } from "@/models/OperationalTask";
import { TeamMember } from "@/models/TeamMember";

import { TeamWorkloadView } from "@/components/dashboard/tasks/TeamWorkloadView";
import { MyWorkSkeleton } from "@/components/dashboard/tasks/TaskSkeletons";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Team Workload Visibility | Admin Dashboard",
  description: "Operational team workload allocation, review queues, and task volume.",
};

export default async function TeamWorkloadPage() {
  await requireSession();
  await connectToDatabase();
  const now = new Date();
  const weekAgo = new Date(Date.now() - 7 * 86400000);

  const [teamMembers, activeTasks, typeAggregations] = await Promise.all([
    TeamMember.find({ status: "ACTIVE" }).select("_id fullName department role").lean(),
    OperationalTask.find({
      status: { $in: ["PENDING_ACCEPTANCE", "TO_DO", "IN_PROGRESS", "IN_REVIEW", "COMPLETED"] },
    })
      .select("assignedUserId status dueAt completedAt")
      .lean(),
    OperationalTask.aggregate([
      { $match: { status: { $in: ["PENDING_ACCEPTANCE", "TO_DO", "IN_PROGRESS", "IN_REVIEW"] } } },
      { $group: { _id: "$taskType", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
  ]);

  const workloadData = teamMembers.map((m: any) => {
    const memberId = m._id.toString();
    const memberTasks = activeTasks.filter((t: any) => t.assignedUserId === memberId);

    const activeCount = memberTasks.filter((t: any) =>
      ["PENDING_ACCEPTANCE", "TO_DO", "IN_PROGRESS", "IN_REVIEW"].includes(t.status)
    ).length;

    const overdueCount = memberTasks.filter(
      (t: any) =>
        ["PENDING_ACCEPTANCE", "TO_DO", "IN_PROGRESS"].includes(t.status) &&
        t.dueAt &&
        new Date(t.dueAt) < now
    ).length;

    const inReviewCount = memberTasks.filter((t: any) => t.status === "IN_REVIEW").length;

    const completedThisWeek = memberTasks.filter(
      (t: any) => t.status === "COMPLETED" && t.completedAt && new Date(t.completedAt) >= weekAgo
    ).length;

    return {
      id: memberId,
      name: m.fullName,
      department: m.department,
      role: m.role,
      activeCount,
      overdueCount,
      inReviewCount,
      completedThisWeek,
    };
  });

  const typeDistribution = typeAggregations.map((a: any) => ({
    type: a._id,
    count: a.count,
  }));

  return (
    <Suspense fallback={<MyWorkSkeleton />}>
      <TeamWorkloadView workloadData={workloadData} typeDistribution={typeDistribution} />
    </Suspense>
  );
}
