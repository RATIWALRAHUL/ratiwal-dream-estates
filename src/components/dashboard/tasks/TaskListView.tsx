"use client";

import React, { useState } from "react";
import Link from "next/link";
import { TaskListItemDTO, TaskStatus, TaskPriority, TaskType, TASK_TYPES, TASK_STATUSES, TASK_PRIORITIES } from "@/types/task";
import { bulkUpdateTasksAction } from "@/lib/actions/task.actions";
import { TaskFormModal } from "./TaskFormModal";
import {
  Search,
  Filter,
  Plus,
  Calendar,
  Layers,
  CheckCircle2,
  Clock,
  ChevronRight,
} from "lucide-react";

interface TeamMemberOption {
  id: string;
  name: string;
  department?: string;
}

interface TaskListViewProps {
  initialTasks: TaskListItemDTO[];
  teamMembers: TeamMemberOption[];
  currentUserId: string;
}

export function TaskListView({
  initialTasks,
  teamMembers,
  currentUserId,
}: TaskListViewProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("ALL");

  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);

  const filteredTasks = tasks.filter((t) => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.taskNumber.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (statusFilter !== "ALL" && t.status !== statusFilter) return false;
    if (priorityFilter !== "ALL" && t.priority !== priorityFilter) return false;
    if (typeFilter !== "ALL" && t.taskType !== typeFilter) return false;
    if (assigneeFilter !== "ALL" && t.assignedUserId !== assigneeFilter) return false;
    return true;
  });

  const toggleSelectAll = () => {
    if (selectedTaskIds.length === filteredTasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(filteredTasks.map((t) => t.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  async function handleBulkStatus(status: TaskStatus) {
    if (selectedTaskIds.length === 0) return;
    setIsBulkSubmitting(true);
    await bulkUpdateTasksAction(selectedTaskIds, { status });
    setSelectedTaskIds([]);
    setIsBulkSubmitting(false);
  }

  const priorityBadges: Record<string, string> = {
    LOW: "text-stone-600 bg-stone-100 border border-stone-200",
    NORMAL: "text-blue-700 bg-blue-50 border border-blue-200 font-medium",
    HIGH: "text-amber-800 bg-amber-50 border border-amber-200 font-semibold",
    URGENT: "text-rose-700 bg-rose-50 border border-rose-200 font-bold",
    CRITICAL: "text-rose-700 bg-rose-50 border border-rose-200 font-bold",
    MEDIUM: "text-blue-700 bg-blue-50 border border-blue-200 font-medium",
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-[#071a28]">
            Operational Tasks Repository
          </h1>
          <p className="text-xs md:text-sm text-[#647581] mt-1">
            Complete team task repository with multi-attribute filtering and bulk operations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/tasks/team"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28] hover:bg-stone-50 transition shadow-2xs"
          >
            <Layers className="w-4 h-4 text-[#0088cc]" />
            <span>Team Board</span>
          </Link>

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

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl border border-[rgba(7,26,40,0.08)] bg-white shadow-2xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-[#647581]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks by number or title..."
              className="w-full pl-10 pr-3 py-2 text-xs rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28] focus:outline-hidden focus:border-[#0088cc] focus:ring-1 focus:ring-[#0088cc]"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28] focus:outline-hidden focus:border-[#0088cc]"
            >
              <option value="ALL">All Statuses</option>
              {TASK_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28] focus:outline-hidden focus:border-[#0088cc]"
            >
              <option value="ALL">All Priorities</option>
              {TASK_PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p} Priority
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28] focus:outline-hidden focus:border-[#0088cc]"
            >
              <option value="ALL">All Assignees</option>
              {teamMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bulk Action Bar */}
        {selectedTaskIds.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[rgba(7,26,40,0.08)] bg-sky-50/60 px-4 py-2.5 rounded-xl">
            <span className="text-xs font-semibold text-[#071a28]">
              {selectedTaskIds.length} task(s) selected
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkStatus("COMPLETED")}
                disabled={isBulkSubmitting}
                className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition shadow-2xs"
              >
                Mark Complete
              </button>
              <button
                onClick={() => handleBulkStatus("CANCELLED")}
                disabled={isBulkSubmitting}
                className="px-3 py-1.5 text-xs font-semibold text-stone-700 bg-stone-200 hover:bg-stone-300 rounded-lg transition shadow-2xs"
              >
                Cancel Selected
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Task Table */}
      <div className="rounded-2xl border border-[rgba(7,26,40,0.08)] bg-white overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[rgba(7,26,40,0.08)] bg-[#f8f7f4] text-[#647581]">
              <tr>
                <th className="p-3.5 w-8 text-center">
                  <input
                    type="checkbox"
                    checked={selectedTaskIds.length === filteredTasks.length && filteredTasks.length > 0}
                    onChange={toggleSelectAll}
                    className="w-3.5 h-3.5 rounded border-stone-300 text-[#0088cc] focus:ring-[#0088cc]"
                  />
                </th>
                <th className="p-3.5 font-semibold text-[#071a28]">Task</th>
                <th className="p-3.5 font-semibold text-[#071a28]">Type</th>
                <th className="p-3.5 font-semibold text-[#071a28]">Status</th>
                <th className="p-3.5 font-semibold text-[#071a28]">Priority</th>
                <th className="p-3.5 font-semibold text-[#071a28]">Assignee</th>
                <th className="p-3.5 font-semibold text-[#071a28]">Due Date</th>
                <th className="p-3.5 text-right font-semibold text-[#071a28]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(7,26,40,0.06)]">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[#647581]">
                    No tasks found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((t) => (
                  <tr
                    key={t.id}
                    className="hover:bg-[#f8f7f4]/60 transition"
                  >
                    <td className="p-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={selectedTaskIds.includes(t.id)}
                        onChange={() => toggleSelect(t.id)}
                        className="w-3.5 h-3.5 rounded border-stone-300 text-[#0088cc] focus:ring-[#0088cc]"
                      />
                    </td>
                    <td className="p-3.5 max-w-xs">
                      <div className="font-mono text-[10px] text-[#647581] font-bold">{t.taskNumber}</div>
                      <Link
                        href={`/dashboard/tasks/${t.id}`}
                        className="font-bold text-[#071a28] hover:text-[#0088cc] line-clamp-1 transition"
                      >
                        {t.title}
                      </Link>
                    </td>
                    <td className="p-3.5 text-[#647581]">
                      {t.taskType.replace(/_/g, " ")}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-full border ${statusBadges[t.status] || "bg-stone-100 text-stone-700 border-stone-200"}`}>
                        {t.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 text-[10px] rounded-full ${priorityBadges[t.priority] || "text-stone-600 bg-stone-100"}`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="p-3.5 text-[#071a28] font-medium">
                      {t.assignedUserName}
                    </td>
                    <td className="p-3.5">
                      <span className={t.isOverdue ? "text-rose-600 font-bold" : "text-[#647581]"}>
                        {new Date(t.dueAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <Link
                        href={`/dashboard/tasks/${t.id}`}
                        className="p-1.5 text-[#647581] hover:text-[#071a28] rounded-lg hover:bg-stone-100 inline-block transition"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TaskFormModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        teamMembers={teamMembers}
        defaultAssigneeId={currentUserId}
      />
    </div>
  );
}
