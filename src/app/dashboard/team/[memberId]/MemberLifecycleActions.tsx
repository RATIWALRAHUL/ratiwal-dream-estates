"use client";

import { useState } from "react";
import { ShieldAlert, UserCheck, ArrowRightLeft } from "lucide-react";
import { suspendTeamMemberAction, reactivateTeamMemberAction } from "@/lib/actions/team.actions";
import { TeamHandoverModal } from "@/components/dashboard/team/TeamHandoverModal";

interface MemberLifecycleActionsProps {
  member: any;
  activeWork: {
    activeLeadsCount: number;
    upcomingSiteVisitsCount: number;
    pendingLegalReviewsCount: number;
    totalActiveItemsCount: number;
  };
  eligibleTargetMembers: any[];
  userRole: string;
}

export function MemberLifecycleActions({
  member,
  activeWork,
  eligibleTargetMembers,
  userRole,
}: MemberLifecycleActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isHandoverOpen, setIsHandoverOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSuspend = async () => {
    const reason = window.prompt(`Enter reason for suspending ${member.fullName}:`);
    if (!reason || !reason.trim()) return;

    setIsLoading(true);
    setError(null);
    const res = await suspendTeamMemberAction(member._id, reason);
    setIsLoading(false);

    if (!res.success) {
      setError(res.message || "Failed to suspend member.");
    }
  };

  const handleReactivate = async () => {
    if (!window.confirm(`Reactivate access for ${member.fullName}?`)) return;

    setIsLoading(true);
    setError(null);
    const res = await reactivateTeamMemberAction(member._id);
    setIsLoading(false);

    if (!res.success) {
      setError(res.message || "Failed to reactivate member.");
    }
  };

  return (
    <>
      <div className="space-y-2">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-sans">
            {error}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {member.status === "ACTIVE" && (
            <>
              <button
                type="button"
                onClick={handleSuspend}
                disabled={isLoading}
                className="px-4 py-2 rounded-xl border border-amber-300 text-amber-800 hover:bg-amber-50 text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Suspend Account</span>
              </button>

              <button
                type="button"
                onClick={() => setIsHandoverOpen(true)}
                disabled={isLoading}
                className="px-4 py-2 rounded-xl bg-amber-600 text-white hover:bg-amber-700 text-xs font-bold flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Handover & Deactivate</span>
              </button>
            </>
          )}

          {member.status === "SUSPENDED" && (
            <button
              type="button"
              onClick={handleReactivate}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Reactivate Member</span>
            </button>
          )}

          {member.status === "DEACTIVATED" && (
            <button
              type="button"
              onClick={handleReactivate}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Restore Account</span>
            </button>
          )}
        </div>
      </div>

      <TeamHandoverModal
        isOpen={isHandoverOpen}
        onClose={() => setIsHandoverOpen(false)}
        sourceMember={member}
        activeWork={activeWork}
        eligibleTargetMembers={eligibleTargetMembers}
      />
    </>
  );
}
