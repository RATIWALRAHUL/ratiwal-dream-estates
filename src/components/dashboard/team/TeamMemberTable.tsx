"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Users,
  Shield,
  Clock,
  MoreHorizontal,
  UserCheck,
  UserX,
  ArrowRightLeft,
  Eye,
  Lock,
} from "lucide-react";
import { MemberStatus, DataScope } from "@/types/settings-team";

const STATUS_BADGES: Record<MemberStatus, { bg: string; text: string; border: string }> = {
  ACTIVE: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  INVITED: { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200" },
  SUSPENDED: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  DEACTIVATED: { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-300" },
  INVITATION_EXPIRED: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
  INVITATION_REVOKED: { bg: "bg-gray-100", text: "text-gray-500", border: "border-gray-300" },
};

interface TeamMemberTableProps {
  members: any[];
  total: number;
  page: number;
  perPage: number;
  userRole: string;
}

export function TeamMemberTable({
  members,
  total,
  page,
  perPage,
  userRole,
}: TeamMemberTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(total / perPage);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs overflow-hidden">
      {/* Desktop Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#f8f7f4] border-b border-[rgba(7,26,40,0.06)] text-[10px] font-mono uppercase tracking-wider text-[#647581]">
              <th className="py-3 px-4">Member Name & ID</th>
              <th className="py-3 px-4">Job Title & Dept</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Data Scope</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Last Active</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(7,26,40,0.04)] font-mono text-xs">
            {members.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-[#647581] italic font-sans">
                  No team members found matching your active filter criteria.
                </td>
              </tr>
            ) : (
              members.map((member) => {
                const statusBadge = STATUS_BADGES[member.status as MemberStatus] || STATUS_BADGES.ACTIVE;

                return (
                  <tr key={member._id} className="hover:bg-[#f8f7f4]/60 transition-colors">
                    <td className="py-3 px-4">
                      <Link
                        href={`/dashboard/team/${member._id}`}
                        className="font-bold text-[#071a28] hover:text-[#087fc3] block font-sans"
                      >
                        {member.fullName}
                      </Link>
                      <span className="text-[10px] text-[#647581] font-mono block">
                        {member.email} • {member.memberReference}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-sans">
                      <span className="font-semibold text-[#071a28] block">{member.jobTitle}</span>
                      <span className="text-[10px] text-[#647581] font-mono block">{member.department}</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#071a28]/5 text-[#071a28] border border-[rgba(7,26,40,0.1)]">
                        {member.roleKey.replace(/_/g, " ")}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-[#647581] font-mono text-[11px]">
                      {member.dataScope.replace(/_/g, " ")}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}
                      >
                        {member.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-[#647581]">
                      {member.lastActivityAt
                        ? new Date(member.lastActivityAt).toLocaleDateString()
                        : member.lastLoginAt
                        ? new Date(member.lastLoginAt).toLocaleDateString()
                        : "Never"}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 font-sans">
                        <Link
                          href={`/dashboard/team/${member._id}`}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-[#087fc3] hover:bg-[#f8f7f4]"
                          title="View Member Profile"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>

                        <Link
                          href={`/dashboard/team/${member._id}/permissions`}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-[#071a28] hover:bg-[#f8f7f4]"
                          title="Edit Permissions & Scope"
                        >
                          <Shield className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-[rgba(7,26,40,0.06)] flex items-center justify-between text-xs text-[#647581]">
          <span>
            Page {page} of {totalPages} ({total} total team members)
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-xl border border-[rgba(7,26,40,0.1)] hover:bg-[#f8f7f4] font-bold text-[#071a28] disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-xl border border-[rgba(7,26,40,0.1)] hover:bg-[#f8f7f4] font-bold text-[#071a28] disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
