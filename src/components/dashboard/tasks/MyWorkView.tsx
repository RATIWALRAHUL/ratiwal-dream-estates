"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Play,
  Eye,
  ChevronRight,
  Filter,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { TaskListItemDTO, MyWorkMetrics } from "@/types/task";
import {
  acceptTaskAction,
  startTaskAction,
  submitTaskForReviewAction,
  updateTaskStatusAction,
} from "@/lib/actions/task.actions";
import { TaskFormModal } from "./TaskFormModal";
import { FollowUpOutcomeModal } from "./FollowUpOutcomeModal";

interface TeamMemberOption {
  id: string;
  name: string;
  department?: string;
}

interface MyWorkViewProps {
  tasks: TaskListItemDTO[];
  metrics: MyWorkMetrics;
  currentUserId: string;
  teamMembers: TeamMemberOption[];
  activeTab: string;
}

export function MyWorkView({
  tasks: initialTasks,
  metrics,
  currentUserId,
  teamMembers,
  activeTab: initialActiveTab,
}: MyWorkViewProps) {
  const [activeTab, setActiveTab] = useState(initialActiveTab);
  const [tasks, setTasks] = useState<TaskListItemDTO[]>(initialTasks);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [followUpModalState, setFollowUpModalState] = useState<{
    isOpen: boolean;
    leadId: string;
    taskId?: string;
    leadName?: string;
  }>({
    isOpen: false,
    leadId: "",
  });
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleAccept = (taskId: string) => {
    setActionInProgress(taskId);
    startTransition(async () => {
      const res = await acceptTaskAction(taskId);
      if (res.success) {
        setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: "TO_DO" as const } : t)));
      }
      setActionInProgress(null);
    });
  };

  const handleStart = (taskId: string) => {
    setActionInProgress(taskId);
    startTransition(async () => {
      const res = await startTaskAction(taskId);
      if (res.success) {
        setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: "IN_PROGRESS" as const } : t)));
      }
      setActionInProgress(null);
    });
  };

  const handleReview = (taskId: string) => {
    setActionInProgress(taskId);
    startTransition(async () => {
      const res = await submitTaskForReviewAction(taskId);
      if (res.success) {
        setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: "IN_REVIEW" as const } : t)));
      }
      setActionInProgress(null);
    });
  };

  const handleComplete = (taskId: string) => {
    setActionInProgress(taskId);
    startTransition(async () => {
      const res = await updateTaskStatusAction(taskId, "COMPLETED", "Task completed directly.");
      if (res.success) {
        setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: "COMPLETED" as const } : t)));
      }
      setActionInProgress(null);
    });
  };

  const priorityBadges: Record<string, string> = {
    CRITICAL: "bg-rose-50 text-rose-700 border-rose-200 font-bold",
    HIGH: "bg-amber-50 text-amber-800 border-amber-200 font-semibold",
    MEDIUM: "bg-blue-50 text-blue-700 border-blue-200",
    LOW: "bg-stone-100 text-stone-600 border-stone-200",
  };

  const statusBadges: Record<string, string> = {
    PENDING_ACCEPTANCE: "bg-amber-50 text-amber-800 border-amber-200",
    TO_DO: "bg-stone-100 text-stone-700 border-stone-200",
    IN_PROGRESS: "bg-blue-50 text-blue-800 border-blue-200",
    IN_REVIEW: "bg-purple-50 text-purple-800 border-purple-200",
    COMPLETED: "bg-emerald-50 text-emerald-800 border-emerald-200",
    REJECTED: "bg-rose-50 text-rose-800 border-rose-200",
    CANCELLED: "bg-stone-100 text-stone-500 border-stone-200",
    ARCHIVED: "bg-stone-100 text-stone-400 border-stone-200",
  };

  const kpis = [
    {
      id: "TODAY",
      label: "Due Today",
      count: metrics.dueTodayCount,
      color: "text-[#071a28]",
      badge: "bg-amber-50 text-amber-700 border-amber-200",
      activeRing: "border-[#0088cc] ring-2 ring-[#0088cc]/20 bg-sky-50/40",
    },
    {
      id: "OVERDUE",
      label: "Overdue",
      count: metrics.overdueCount,
      color: "text-rose-600",
      badge: "bg-rose-50 text-rose-700 border-rose-200",
      activeRing: "border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/40",
    },
    {
      id: "AWAITING_ACCEPTANCE",
      label: "Awaiting Acceptance",
      count: metrics.awaitingAcceptanceCount,
      color: "text-amber-600",
      badge: "bg-amber-50 text-amber-700 border-amber-200",
      activeRing: "border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/40",
    },
    {
      id: "IN_PROGRESS",
      label: "In Progress",
      count: metrics.inProgressCount,
      color: "text-blue-600",
      badge: "bg-blue-50 text-blue-700 border-blue-200",
      activeRing: "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/40",
    },
    {
      id: "IN_REVIEW",
      label: "In Review",
      count: metrics.inReviewCount,
      color: "text-purple-600",
      badge: "bg-purple-50 text-purple-700 border-purple-200",
      activeRing: "border-purple-500 ring-2 ring-purple-500/20 bg-purple-50/40",
    },
    {
      id: "COMPLETED",
      label: "Completed (7d)",
      count: metrics.completedThisWeekCount,
      color: "text-emerald-600",
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
      activeRing: "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/40",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-[#071a28]">
            My Work Queue
          </h1>
          <p className="text-xs md:text-sm text-[#647581] mt-1">
            Prioritized operational tasks, CRM follow-ups, and review assignments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/tasks/calendar"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28] hover:bg-stone-50 transition shadow-2xs"
          >
            <Calendar className="w-4 h-4 text-[#0088cc]" />
            <span>Calendar</span>
          </Link>

          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0088cc] hover:bg-[#0077b5] rounded-xl shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((kpi) => {
          const isSelected = activeTab === kpi.id;
          return (
            <button
              key={kpi.id}
              onClick={() => setActiveTab(kpi.id)}
              className={`p-4 rounded-2xl border text-left transition shadow-2xs cursor-pointer ${
                isSelected
                  ? kpi.activeRing
                  : "border-[rgba(7,26,40,0.08)] bg-white hover:border-[rgba(7,26,40,0.18)] hover:shadow-xs"
              }`}
            >
              <div className="text-[11px] font-medium text-[#647581]">{kpi.label}</div>
              <div className={`text-2xl font-serif font-bold ${kpi.color} mt-1.5`}>
                {kpi.count}
              </div>
            </button>
          );
        })}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[rgba(7,26,40,0.08)] overflow-x-auto pb-2">
        {[
          { id: "TODAY", label: "Due Today" },
          { id: "OVERDUE", label: "Overdue" },
          { id: "AWAITING_ACCEPTANCE", label: "Awaiting Acceptance" },
          { id: "IN_PROGRESS", label: "In Progress" },
          { id: "IN_REVIEW", label: "Review Queue" },
          { id: "ALL", label: "All Active" },
          { id: "COMPLETED", label: "Completed" },
        ].map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition cursor-pointer ${
                isSelected
                  ? "bg-[#071a28] text-white shadow-xs"
                  : "text-[#647581] hover:text-[#071a28] hover:bg-white bg-white/50 border border-transparent hover:border-[rgba(7,26,40,0.08)]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tasks Stream */}
      {tasks.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-[rgba(7,26,40,0.08)] bg-white shadow-[0_4px_24px_rgba(7,26,40,0.02)]">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h3 className="font-serif text-base md:text-lg font-bold text-[#071a28]">
            No tasks in this section
          </h3>
          <p className="text-xs text-[#647581] mt-1 max-w-sm mx-auto">
            You&apos;re all caught up on this queue. Check other tabs or create a new task.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((t) => (
            <div
              key={t.id}
              className="p-5 rounded-2xl border border-[rgba(7,26,40,0.08)] bg-white hover:border-[#0088cc]/40 hover:shadow-[0_6px_24px_rgba(0,136,204,0.06)] shadow-2xs transition"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-[#647581]">
                      {t.taskNumber}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-full border ${
                        statusBadges[t.status] || "bg-stone-100 text-stone-700 border-stone-200"
                      }`}
                    >
                      {t.status.replace(/_/g, " ")}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 text-[10px] rounded-full border ${
                        priorityBadges[t.priority] || "bg-stone-100 text-stone-600 border-stone-200"
                      }`}
                    >
                      {t.priority}
                    </span>
                    <span className="text-[10px] font-medium text-[#647581] bg-[#f8f7f4] border border-[rgba(7,26,40,0.06)] px-2 py-0.5 rounded-lg">
                      {t.taskType.replace(/_/g, " ")}
                    </span>
                  </div>

                  <div>
                    <Link
                      href={`/dashboard/tasks/${t.id}`}
                      className="font-serif text-base font-bold text-[#071a28] hover:text-[#0088cc] transition"
                    >
                      {t.title}
                    </Link>
                    {t.description && (
                      <p className="text-xs text-[#647581] line-clamp-1 mt-0.5">
                        {t.description}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#647581]">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#0088cc]" />
                      <span className={t.isOverdue ? "text-rose-600 font-bold" : "font-medium"}>
                        Due {new Date(t.dueAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    {t.relatedEntitySummary && (
                      <div className="flex items-center gap-1 text-[#071a28] bg-[#f8f7f4] border border-[rgba(7,26,40,0.06)] px-2.5 py-0.5 rounded-lg font-medium text-[11px]">
                        <span>{t.relatedEntitySummary}</span>
                      </div>
                    )}

                    {t.propertyTitle && (
                      <span className="text-[#0088cc] font-medium text-[11px]">
                        {t.propertyTitle}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-[rgba(7,26,40,0.06)]">
                  {t.taskType === "LEAD_FOLLOW_UP" && t.relatedEntityId && t.status !== "COMPLETED" ? (
                    <button
                      onClick={() =>
                        setFollowUpModalState({
                          isOpen: true,
                          leadId: t.relatedEntityId!,
                          taskId: t.id,
                          leadName: t.relatedEntitySummary,
                        })
                      }
                      className="px-3.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Record Outcome</span>
                    </button>
                  ) : null}

                  {t.status === "PENDING_ACCEPTANCE" && (
                    <button
                      onClick={() => handleAccept(t.id)}
                      disabled={actionInProgress === t.id}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0088cc] hover:bg-[#0077b5] rounded-xl transition disabled:opacity-50 shadow-2xs cursor-pointer"
                    >
                      Accept Task
                    </button>
                  )}

                  {t.status === "TO_DO" && (
                    <button
                      onClick={() => handleStart(t.id)}
                      disabled={actionInProgress === t.id}
                      className="px-3.5 py-1.5 text-xs font-semibold text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 text-blue-600" />
                      <span>Start Work</span>
                    </button>
                  )}

                  {t.status === "IN_PROGRESS" && t.taskType !== "LEAD_FOLLOW_UP" && (
                    <>
                      {t.reviewerUserName ? (
                        <button
                          onClick={() => handleReview(t.id)}
                          disabled={actionInProgress === t.id}
                          className="px-3.5 py-1.5 text-xs font-semibold text-purple-800 bg-purple-50 hover:bg-purple-100 rounded-xl border border-purple-200 transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-purple-600" />
                          <span>Submit for Review</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleComplete(t.id)}
                          disabled={actionInProgress === t.id}
                          className="px-3.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Mark Complete</span>
                        </button>
                      )}
                    </>
                  )}

                  <Link
                    href={`/dashboard/tasks/${t.id}`}
                    className="p-2 text-[#647581] hover:text-[#071a28] rounded-xl hover:bg-stone-100 transition"
                    title="View Task Details"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Creation Modal */}
      <TaskFormModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        teamMembers={teamMembers}
        defaultAssigneeId={currentUserId}
      />

      {/* Lead Follow-Up Outcome Modal */}
      <FollowUpOutcomeModal
        isOpen={followUpModalState.isOpen}
        onClose={() => setFollowUpModalState({ isOpen: false, leadId: "" })}
        leadId={followUpModalState.leadId}
        taskId={followUpModalState.taskId}
        leadName={followUpModalState.leadName}
      />
    </div>
  );
}
