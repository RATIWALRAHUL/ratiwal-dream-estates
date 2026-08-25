"use client";

import { useState } from "react";
import { X, ArrowRightLeft, AlertTriangle, CheckCircle2 } from "lucide-react";
import { executeTeamHandoverAction } from "@/lib/actions/team.actions";

interface TeamHandoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceMember: any;
  activeWork: {
    activeLeadsCount: number;
    upcomingSiteVisitsCount: number;
    pendingLegalReviewsCount: number;
    totalActiveItemsCount: number;
  };
  eligibleTargetMembers: any[];
}

export function TeamHandoverModal({
  isOpen,
  onClose,
  sourceMember,
  activeWork,
  eligibleTargetMembers,
}: TeamHandoverModalProps) {
  const [targetMemberId, setTargetMemberId] = useState(
    eligibleTargetMembers.length > 0 ? eligibleTargetMembers[0]._id : ""
  );
  const [reason, setReason] = useState("");
  const [deactivateAfter, setDeactivateAfter] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetMemberId) {
      setError("Please select an active target team member to receive assignments.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const res = await executeTeamHandoverAction({
      sourceMemberId: sourceMember._id,
      targetMemberId,
      reason,
      deactivateSourceAfterHandover: deactivateAfter,
    });

    setIsLoading(false);

    if (res.success) {
      setResult(res);
    } else {
      setError(res.message || "Failed to execute work handover.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-[rgba(7,26,40,0.1)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[rgba(7,26,40,0.06)] flex justify-between items-center bg-[#f8f7f4]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#071a28] text-base">Work Handover & Reassignment</h3>
              <p className="text-xs text-[#647581]">Reassign active leads and visits from {sourceMember.fullName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {result ? (
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="font-bold text-sm">Handover Executed Successfully!</span>
                </div>
                <p className="text-emerald-700 mb-3">
                  All active workloads have been reallocated and recorded in the audit log.
                </p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200">
                    <span className="block text-base font-bold text-emerald-900">{result.leadsReassignedCount}</span>
                    <span className="text-[10px] text-emerald-700">Leads Reassigned</span>
                  </div>
                  <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200">
                    <span className="block text-base font-bold text-emerald-900">
                      {result.siteVisitsReassignedCount}
                    </span>
                    <span className="text-[10px] text-emerald-700">Site Visits</span>
                  </div>
                  <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200">
                    <span className="block text-base font-bold text-emerald-900">
                      {result.legalReviewsReassignedCount}
                    </span>
                    <span className="text-[10px] text-emerald-700">Legal Reviews</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-[#071a28] text-white text-xs font-bold"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Active Work Summary Box */}
              <div className="p-4 rounded-2xl bg-[#f8f7f4] border border-[rgba(7,26,40,0.06)] space-y-2">
                <span className="text-[11px] font-bold text-[#071a28] uppercase font-mono tracking-wider block">
                  Active Workload Summary
                </span>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-white p-2 rounded-xl border border-[rgba(7,26,40,0.08)]">
                    <span className="block font-bold text-sm text-[#071a28]">{activeWork.activeLeadsCount}</span>
                    <span className="text-[10px] text-[#647581]">Active Leads</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-[rgba(7,26,40,0.08)]">
                    <span className="block font-bold text-sm text-[#071a28]">
                      {activeWork.upcomingSiteVisitsCount}
                    </span>
                    <span className="text-[10px] text-[#647581]">Upcoming Visits</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-[rgba(7,26,40,0.08)]">
                    <span className="block font-bold text-sm text-[#071a28]">
                      {activeWork.pendingLegalReviewsCount}
                    </span>
                    <span className="text-[10px] text-[#647581]">Legal Reviews</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#071a28] mb-1.5">
                  Target Assignee (Active Member) *
                </label>
                <select
                  value={targetMemberId}
                  onChange={(e) => setTargetMemberId(e.target.value)}
                  required
                  className="w-full text-xs bg-white border border-[rgba(7,26,40,0.12)] rounded-xl px-3.5 py-2.5 text-[#071a28] focus:outline-hidden focus:border-[#087fc3]"
                >
                  {eligibleTargetMembers.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.fullName} ({m.roleKey.replace(/_/g, " ")}) — {m.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#071a28] mb-1.5">Handover Reason *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Employee offboarding / Department transfer..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full text-xs bg-white border border-[rgba(7,26,40,0.12)] rounded-xl px-3.5 py-2.5 text-[#071a28] focus:outline-hidden focus:border-[#087fc3]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="deactivateAfter"
                  checked={deactivateAfter}
                  onChange={(e) => setDeactivateAfter(e.target.checked)}
                  className="rounded text-[#087fc3] focus:ring-[#087fc3]"
                />
                <label htmlFor="deactivateAfter" className="text-xs text-[#071a28] font-semibold cursor-pointer">
                  Deactivate {sourceMember.fullName}&apos;s account immediately after handover
                </label>
              </div>

              <div className="pt-4 border-t border-[rgba(7,26,40,0.06)] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] text-[#071a28] text-xs font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 shadow-xs flex items-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? "Executing Handover..." : "Execute Handover"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
