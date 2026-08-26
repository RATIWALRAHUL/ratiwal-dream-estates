"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Users, Briefcase } from "lucide-react";

interface MemberWorkload {
  id: string;
  name: string;
  department?: string;
  role: string;
  activeCount: number;
  overdueCount: number;
  inReviewCount: number;
  completedThisWeek: number;
}

interface TeamWorkloadViewProps {
  workloadData: MemberWorkload[];
  typeDistribution: { type: string; count: number }[];
}

export function TeamWorkloadView({
  workloadData,
  typeDistribution,
}: TeamWorkloadViewProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard/my-work"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#647581] hover:text-[#071a28] mb-1 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Work Queue</span>
          </Link>
          <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-[#071a28]">
            Team Workload & Queue Visibility
          </h1>
          <p className="text-xs md:text-sm text-[#647581] mt-1">
            Departmental task volume, review queues, and operational capacity distribution.
          </p>
        </div>
      </div>

      {/* Task Distribution by Type */}
      <div className="p-6 rounded-3xl border border-[rgba(7,26,40,0.08)] bg-white shadow-2xs space-y-4">
        <h3 className="font-serif text-base font-bold text-[#071a28] flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-[#0088cc]" />
          <span>Active Task Volume by Workflow Type</span>
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {typeDistribution.map((item) => (
            <div
              key={item.type}
              className="p-4 rounded-2xl border border-[rgba(7,26,40,0.06)] bg-[#f8f7f4]"
            >
              <span className="text-[11px] font-semibold text-[#647581] block truncate">
                {item.type.replace(/_/g, " ")}
              </span>
              <span className="text-xl font-serif font-bold text-[#071a28] mt-1 block">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Member Workload Table */}
      <div className="rounded-3xl border border-[rgba(7,26,40,0.08)] bg-white overflow-hidden shadow-2xs">
        <div className="px-6 py-4 border-b border-[rgba(7,26,40,0.08)] bg-[#f8f7f4] flex items-center justify-between">
          <h3 className="font-serif text-base font-bold text-[#071a28] flex items-center gap-2">
            <Users className="w-4 h-4 text-[#0088cc]" />
            <span>Staff Workload Allocation</span>
          </h3>
          <span className="text-xs font-semibold text-[#647581]">
            Total Team Members: {workloadData.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[rgba(7,26,40,0.08)] bg-[#f8f7f4]/60 text-[#647581]">
              <tr>
                <th className="p-3.5 font-semibold text-[#071a28]">Team Member</th>
                <th className="p-3.5 font-semibold text-[#071a28]">Department</th>
                <th className="p-3.5 font-semibold text-[#071a28]">Role</th>
                <th className="p-3.5 font-semibold text-center text-[#071a28]">Active Tasks</th>
                <th className="p-3.5 font-semibold text-center text-[#071a28]">Overdue</th>
                <th className="p-3.5 font-semibold text-center text-[#071a28]">In Review</th>
                <th className="p-3.5 font-semibold text-center text-[#071a28]">Completed (7d)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(7,26,40,0.06)]">
              {workloadData.map((m) => (
                <tr key={m.id} className="hover:bg-[#f8f7f4]/60 transition">
                  <td className="p-3.5 font-bold text-[#071a28]">
                    {m.name}
                  </td>
                  <td className="p-3.5 text-[#647581]">
                    {m.department || "General"}
                  </td>
                  <td className="p-3.5 text-[#647581]">
                    {m.role}
                  </td>
                  <td className="p-3.5 text-center font-bold text-[#071a28]">
                    {m.activeCount}
                  </td>
                  <td className="p-3.5 text-center">
                    <span className={m.overdueCount > 0 ? "text-rose-600 font-bold" : "text-[#647581]"}>
                      {m.overdueCount}
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <span className={m.inReviewCount > 0 ? "text-purple-600 font-bold" : "text-[#647581]"}>
                      {m.inReviewCount}
                    </span>
                  </td>
                  <td className="p-3.5 text-center font-bold text-emerald-600">
                    {m.completedThisWeek}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
