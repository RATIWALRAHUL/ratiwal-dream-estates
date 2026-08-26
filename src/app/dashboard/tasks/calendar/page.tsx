import "server-only";

import { Suspense } from "react";
import { requireSession } from "@/lib/auth/session";
import { TaskQueryService } from "@/lib/services/task-query.service";
import { TaskCalendarView } from "@/components/dashboard/tasks/TaskCalendarView";
import { MyWorkSkeleton } from "@/components/dashboard/tasks/TaskSkeletons";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tasks Calendar | Admin Dashboard",
  description: "Monthly calendar view of task due dates in IST.",
};

export default async function TaskCalendarPage() {
  const session = await requireSession();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);

  const tasks = await TaskQueryService.getCalendarTasks(startOfMonth, endOfMonth);

  return (
    <Suspense fallback={<MyWorkSkeleton />}>
      <TaskCalendarView initialTasks={tasks} currentUserId={session.user.id} />
    </Suspense>
  );
}
