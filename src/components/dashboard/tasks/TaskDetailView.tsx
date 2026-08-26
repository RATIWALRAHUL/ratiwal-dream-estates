"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  acceptTaskAction,
  startTaskAction,
  submitTaskForReviewAction,
  approveTaskAction,
  returnTaskForChangesAction,
  reassignTaskAction,
  updateTaskStatusAction,
  addTaskCommentAction,
} from "@/lib/actions/task.actions";
import {
  CheckCircle2,
  Clock,
  ArrowLeft,
  MessageSquare,
  History,
  Send,
  ExternalLink,
  RotateCcw,
  Check,
  Eye,
  UserCheck,
} from "lucide-react";

interface TeamMemberOption {
  id: string;
  name: string;
  department?: string;
}

interface TaskDetailViewProps {
  taskData: {
    task: any;
    activities: any[];
    comments: any[];
  };
  teamMembers: TeamMemberOption[];
  currentUserId: string;
}

export function TaskDetailView({
  taskData,
  teamMembers,
  currentUserId,
}: TaskDetailViewProps) {
  const { task, activities, comments } = taskData;
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Reassignment modal state
  const [isReassignOpen, setIsReassignOpen] = useState(false);
  const [newAssigneeId, setNewAssigneeId] = useState("");
  const [reassignReason, setReassignReason] = useState("");

  // Return for changes modal state
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [returnReason, setReturnReason] = useState("");

  async function handleAccept() {
    setActionInProgress("accept");
    await acceptTaskAction(task._id);
    setActionInProgress(null);
  }

  async function handleStart() {
    setActionInProgress("start");
    await startTaskAction(task._id);
    setActionInProgress(null);
  }

  async function handleSubmitReview() {
    setActionInProgress("review");
    await submitTaskForReviewAction(task._id);
    setActionInProgress(null);
  }

  async function handleApprove() {
    setActionInProgress("approve");
    await approveTaskAction(task._id);
    setActionInProgress(null);
  }

  async function handleReturn() {
    if (!returnReason.trim()) return;
    setActionInProgress("return");
    await returnTaskForChangesAction(task._id, returnReason.trim());
    setIsReturnOpen(false);
    setActionInProgress(null);
  }

  async function handleReassign() {
    if (!newAssigneeId || !reassignReason.trim()) return;
    setActionInProgress("reassign");
    await reassignTaskAction(task._id, newAssigneeId, reassignReason.trim());
    setIsReassignOpen(false);
    setActionInProgress(null);
  }

  async function handleComplete() {
    setActionInProgress("complete");
    await updateTaskStatusAction(task._id, "COMPLETED", "Task completed directly.");
    setActionInProgress(null);
  }

  async function handleCommentSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim()) return;
    setIsSubmittingComment(true);
    await addTaskCommentAction(task._id, commentText.trim());
    setCommentText("");
    setIsSubmittingComment(false);
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/dashboard/my-work"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#647581] hover:text-[#071a28] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Work Queue</span>
        </Link>
      </div>

      {/* Main Task Card */}
      <div className="p-6 md:p-8 rounded-3xl border border-[rgba(7,26,40,0.08)] bg-white shadow-[0_4px_24px_rgba(7,26,40,0.02)] space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#647581]">
                {task.taskNumber}
              </span>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                {task.status.replace(/_/g, " ")}
              </span>
              <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                {task.priority} Priority
              </span>
              <span className="text-xs text-[#647581] bg-[#f8f7f4] border border-[rgba(7,26,40,0.06)] px-2.5 py-0.5 rounded-lg">
                {task.taskType.replace(/_/g, " ")}
              </span>
            </div>

            <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#071a28]">
              {task.title}
            </h1>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {task.status === "PENDING_ACCEPTANCE" && (
              <button
                onClick={handleAccept}
                disabled={actionInProgress !== null}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#0088cc] hover:bg-[#0077b5] rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
              >
                Accept Task
              </button>
            )}

            {task.status === "TO_DO" && (
              <button
                onClick={handleStart}
                disabled={actionInProgress !== null}
                className="px-4 py-2 text-xs font-semibold text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 shadow-2xs transition disabled:opacity-50 cursor-pointer"
              >
                Start Work
              </button>
            )}

            {task.status === "IN_PROGRESS" && (
              <>
                {task.reviewerUserId ? (
                  <button
                    onClick={handleSubmitReview}
                    disabled={actionInProgress !== null}
                    className="px-4 py-2 text-xs font-semibold text-purple-800 bg-purple-50 hover:bg-purple-100 rounded-xl border border-purple-200 shadow-2xs transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Submit for Review</span>
                  </button>
                ) : (
                  <button
                    onClick={handleComplete}
                    disabled={actionInProgress !== null}
                    className="px-4 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 shadow-2xs transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Mark Complete</span>
                  </button>
                )}
              </>
            )}

            {task.status === "IN_REVIEW" && (
              <>
                <button
                  onClick={handleApprove}
                  disabled={actionInProgress !== null}
                  className="px-4 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 shadow-2xs transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Approve & Complete</span>
                </button>

                <button
                  onClick={() => setIsReturnOpen(true)}
                  disabled={actionInProgress !== null}
                  className="px-4 py-2 text-xs font-semibold text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-rose-600" />
                  <span>Return for Changes</span>
                </button>
              </>
            )}

            {!["COMPLETED", "CANCELLED", "ARCHIVED"].includes(task.status) && (
              <button
                onClick={() => setIsReassignOpen(true)}
                disabled={actionInProgress !== null}
                className="px-3.5 py-2 text-xs font-semibold text-[#071a28] bg-[#f8f7f4] border border-[rgba(7,26,40,0.08)] hover:bg-stone-100 rounded-xl transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-[#0088cc]" />
                <span>Reassign</span>
              </button>
            )}
          </div>
        </div>

        {task.description && (
          <div className="p-4 rounded-2xl bg-[#f8f7f4] border border-[rgba(7,26,40,0.06)]">
            <h4 className="text-[11px] font-bold text-[#647581] uppercase tracking-wider mb-1">
              Instructions / Description
            </h4>
            <p className="text-xs md:text-sm text-[#071a28] whitespace-pre-line leading-relaxed">
              {task.description}
            </p>
          </div>
        )}

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-[rgba(7,26,40,0.06)] text-xs">
          <div>
            <span className="text-[#647581] block">Assignee</span>
            <span className="font-bold text-[#071a28]">
              {task.assignedUserName} {task.assignedTeam ? `(${task.assignedTeam})` : ""}
            </span>
          </div>

          <div>
            <span className="text-[#647581] block">Reviewer</span>
            <span className="font-bold text-[#071a28]">
              {task.reviewerUserName || "None"}
            </span>
          </div>

          <div>
            <span className="text-[#647581] block">Due Date</span>
            <span className="font-bold text-[#071a28]">
              {new Date(task.dueAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
            </span>
          </div>

          <div>
            <span className="text-[#647581] block">Assigned By</span>
            <span className="font-bold text-[#071a28]">
              {task.assignedByUserName || "System"}
            </span>
          </div>
        </div>

        {/* Linked Entity Card */}
        {task.relatedEntityType && (
          <div className="p-4 rounded-2xl border border-sky-200 bg-sky-50/50 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#0088cc] uppercase tracking-wider">
                Linked Business Entity ({task.relatedEntityType})
              </span>
              <p className="text-sm font-bold text-[#071a28] mt-0.5">
                {task.relatedEntitySummary || `${task.relatedEntityType} Reference`}
              </p>
            </div>

            {task.relatedEntityType === "LEAD" && task.relatedEntityId && (
              <Link
                href={`/dashboard/leads/${task.relatedEntityId}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0088cc] hover:bg-[#0077b5] rounded-xl shadow-xs transition"
              >
                <span>View CRM Lead</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Two Columns: Comments & Activity History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Comments Column */}
        <div className="p-6 rounded-3xl border border-[rgba(7,26,40,0.08)] bg-white shadow-[0_4px_24px_rgba(7,26,40,0.02)] space-y-4">
          <div className="flex items-center gap-2 border-b border-[rgba(7,26,40,0.06)] pb-3">
            <MessageSquare className="w-4 h-4 text-[#0088cc]" />
            <h3 className="font-serif text-base font-bold text-[#071a28]">
              Internal Team Comments ({comments.length})
            </h3>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {comments.length === 0 ? (
              <p className="text-xs text-[#647581] text-center py-6">
                No comments on this task yet.
              </p>
            ) : (
              comments.map((c: any) => (
                <div
                  key={c._id}
                  className="p-3.5 rounded-2xl bg-[#f8f7f4] border border-[rgba(7,26,40,0.06)] space-y-1"
                >
                  <div className="flex items-center justify-between text-[11px] text-[#647581]">
                    <span className="font-bold text-[#071a28]">
                      {c.authorName} ({c.authorRole})
                    </span>
                    <span>
                      {new Date(c.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-xs text-[#071a28] whitespace-pre-line leading-relaxed">
                    {c.content}
                  </p>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleCommentSubmit} className="pt-2 border-t border-[rgba(7,26,40,0.06)] flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add an internal comment or update..."
              className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28] focus:outline-hidden focus:border-[#0088cc]"
            />
            <button
              type="submit"
              disabled={isSubmittingComment || !commentText.trim()}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#0088cc] hover:bg-[#0077b5] rounded-xl shadow-xs transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>

        {/* Activity Timeline Column */}
        <div className="p-6 rounded-3xl border border-[rgba(7,26,40,0.08)] bg-white shadow-[0_4px_24px_rgba(7,26,40,0.02)] space-y-4">
          <div className="flex items-center gap-2 border-b border-[rgba(7,26,40,0.06)] pb-3">
            <History className="w-4 h-4 text-[#0088cc]" />
            <h3 className="font-serif text-base font-bold text-[#071a28]">
              Audit Activity History ({activities.length})
            </h3>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {activities.map((a: any) => (
              <div key={a._id} className="relative pl-5 border-l-2 border-[#0088cc]/40 text-xs space-y-0.5">
                <div className="font-bold text-[#071a28]">
                  {a.activityType.replace(/_/g, " ")} by {a.actorName}
                </div>
                {a.comment && (
                  <p className="text-[#647581] italic">&ldquo;{a.comment}&rdquo;</p>
                )}
                {a.newAssigneeName && (
                  <p className="text-[#647581]">
                    Reassigned to <span className="font-bold text-[#071a28]">{a.newAssigneeName}</span>
                  </p>
                )}
                <span className="text-[10px] text-[#647581] block">
                  {new Date(a.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reassign Modal */}
      {isReassignOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl border border-[rgba(7,26,40,0.08)] bg-white shadow-2xl p-6 space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#071a28]">
              Reassign Task
            </h3>

            <div>
              <label className="block text-xs font-semibold text-[#071a28] mb-1">
                New Assignee
              </label>
              <select
                value={newAssigneeId}
                onChange={(e) => setNewAssigneeId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28] focus:outline-hidden focus:border-[#0088cc]"
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
              <label className="block text-xs font-semibold text-[#071a28] mb-1">
                Reason for Reassignment <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={reassignReason}
                onChange={(e) => setReassignReason(e.target.value)}
                rows={3}
                placeholder="Explain handover / reassignment rationale..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28] focus:outline-hidden focus:border-[#0088cc]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsReassignOpen(false)}
                className="px-3.5 py-2 text-xs text-[#647581] hover:bg-stone-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReassign}
                disabled={!newAssigneeId || !reassignReason.trim()}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#0088cc] hover:bg-[#0077b5] rounded-xl shadow-xs transition disabled:opacity-50"
              >
                Confirm Reassignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return for changes modal */}
      {isReturnOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl border border-[rgba(7,26,40,0.08)] bg-white shadow-2xl p-6 space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#071a28]">
              Return Task for Revisions
            </h3>

            <div>
              <label className="block text-xs font-semibold text-[#071a28] mb-1">
                Specific Changes Required <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                rows={4}
                placeholder="List document errors, missing buyer details, or required corrections..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28] focus:outline-hidden focus:border-[#0088cc]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsReturnOpen(false)}
                className="px-3.5 py-2 text-xs text-[#647581] hover:bg-stone-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReturn}
                disabled={!returnReason.trim()}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition disabled:opacity-50"
              >
                Return Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
