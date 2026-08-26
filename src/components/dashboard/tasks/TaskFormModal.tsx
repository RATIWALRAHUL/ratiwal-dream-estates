"use client";

import React, { useState } from "react";
import { TASK_TYPES, TASK_PRIORITIES, TaskType, TaskPriority } from "@/types/task";
import { createTaskAction } from "@/lib/actions/task.actions";
import { PlusCircle, X } from "lucide-react";

interface TeamMemberOption {
  id: string;
  name: string;
  department?: string;
}

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamMembers: TeamMemberOption[];
  defaultAssigneeId?: string;
}

export function TaskFormModal({
  isOpen,
  onClose,
  teamMembers,
  defaultAssigneeId,
}: TaskFormModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [taskType, setTaskType] = useState<TaskType>("GENERAL");
  const [priority, setPriority] = useState<TaskPriority>("NORMAL");
  const [assignedUserId, setAssignedUserId] = useState(defaultAssigneeId || (teamMembers[0]?.id || ""));
  const [reviewerUserId, setReviewerUserId] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !assignedUserId || !dueAt) {
      setError("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("taskType", taskType);
    formData.append("priority", priority);
    formData.append("assignedUserId", assignedUserId);
    formData.append("dueAt", dueAt);
    if (reviewerUserId) formData.append("reviewerUserId", reviewerUserId);

    const res = await createTaskAction(formData);
    setIsSubmitting(false);

    if (res.success) {
      onClose();
    } else {
      setError(res.message || "Failed to create task.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-xl rounded-3xl border border-[rgba(7,26,40,0.08)] bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(7,26,40,0.08)] bg-[#f8f7f4]">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-[#0088cc]" />
            <h3 className="font-serif text-lg font-bold text-[#071a28]">
              Create Operational Task
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#647581] hover:text-[#071a28] hover:bg-stone-200/50 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 text-xs text-rose-700 bg-rose-50 rounded-xl border border-rose-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#071a28] mb-1.5">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Verify registry documents for Royal Palms Plot #42"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28] focus:outline-hidden focus:border-[#0088cc]"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#071a28] mb-1.5">
                Task Type
              </label>
              <select
                value={taskType}
                onChange={(e) => setTaskType(e.target.value as TaskType)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28] focus:outline-hidden focus:border-[#0088cc]"
              >
                {TASK_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#071a28] mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28] focus:outline-hidden focus:border-[#0088cc]"
              >
                {TASK_PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#071a28] mb-1.5">
                Assignee <span className="text-rose-500">*</span>
              </label>
              <select
                value={assignedUserId}
                onChange={(e) => setAssignedUserId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28] focus:outline-hidden focus:border-[#0088cc]"
                required
              >
                <option value="">Select team member...</option>
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} {m.department ? `(${m.department})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#071a28] mb-1.5">
                Due Date & Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28] focus:outline-hidden focus:border-[#0088cc]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#071a28] mb-1.5">
              Reviewer (Optional)
            </label>
            <select
              value={reviewerUserId}
              onChange={(e) => setReviewerUserId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28] focus:outline-hidden focus:border-[#0088cc]"
            >
              <option value="">No reviewer required</option>
              {teamMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} {m.department ? `(${m.department})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#071a28] mb-1.5">
              Description / Action Steps
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Provide background context, required documents, or instructions..."
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28] focus:outline-hidden focus:border-[#0088cc]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[rgba(7,26,40,0.08)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#647581] hover:bg-stone-100 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#0088cc] hover:bg-[#0077b5] rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
