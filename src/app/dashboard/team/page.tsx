import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongoose";
import { TeamMember } from "@/models/TeamMember";
import { TeamInvitation } from "@/models/TeamInvitation";
import { TeamService } from "@/lib/services/team.service";
import { TeamMemberTable } from "@/components/dashboard/team/TeamMemberTable";
import { TeamInviteButton } from "./TeamInviteButton";
import { Users, UserCheck, Mail, ShieldAlert, Clock, UserPlus } from "lucide-react";
import { MemberStatus } from "@/types/settings-team";

interface TeamPageProps {
  searchParams: Promise<{
    status?: string;
    department?: string;
    roleKey?: string;
    search?: string;
    page?: string;
  }>;
}

export const metadata = {
  title: "Team Management | Ratiwal Dream Estates",
  description: "Manage team directory, member roles, data scopes, and invitations.",
};

export default async function TeamPage({ searchParams }: TeamPageProps) {
  const session = await getAdminSession();
  if (!session) redirect("/dashboard/login");

  await connectToDatabase();
  await TeamService.syncInitialSuperAdmin(session.user);

  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page || "1", 10);
  const status = resolvedParams.status as MemberStatus | undefined;
  const department = resolvedParams.department;
  const roleKey = resolvedParams.roleKey;
  const search = resolvedParams.search;

  const [
    { members, total, perPage },
    totalActive,
    totalPendingInvites,
    totalSuspended,
  ] = await Promise.all([
    TeamService.queryMembers({
      status,
      department,
      roleKey,
      search,
      page,
      perPage: 20,
    }),
    TeamMember.countDocuments({ status: "ACTIVE" }),
    TeamInvitation.countDocuments({ status: "INVITED", expiresAt: { $gte: new Date() } }),
    TeamMember.countDocuments({ status: "SUSPENDED" }),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#087fc3] bg-[#087fc3]/10 px-2.5 py-0.5 rounded-full">
              PRD 10 • Team & Access
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#071a28]">Team Directory & Permissions</h1>
          <p className="text-xs text-[#647581] mt-1">
            Manage organization members, assign role-based data scopes, and track invitations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/team/invitations"
            className="px-4 py-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] text-[#071a28] text-xs font-bold hover:bg-[#f8f7f4] flex items-center gap-2 transition-colors"
          >
            <Mail className="w-4 h-4 text-[#647581]" />
            <span>Pending Invitations ({totalPendingInvites})</span>
          </Link>

          <TeamInviteButton userRole={session.user.role} />
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase text-[#647581] font-bold">Active Members</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#071a28]">{totalActive}</div>
          <span className="text-[10px] text-[#647581] mt-0.5 block">Authorized platform users</span>
        </div>

        <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase text-[#647581] font-bold">Pending Invites</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#071a28]">{totalPendingInvites}</div>
          <span className="text-[10px] text-[#647581] mt-0.5 block">Hashed one-time tokens</span>
        </div>

        <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase text-[#647581] font-bold">Suspended</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#071a28]">{totalSuspended}</div>
          <span className="text-[10px] text-[#647581] mt-0.5 block">Temporarily locked access</span>
        </div>

        <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase text-[#647581] font-bold">Total Accounts</span>
            <div className="w-8 h-8 rounded-xl bg-[#071a28]/5 text-[#071a28] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#071a28]">{total}</div>
          <span className="text-[10px] text-[#647581] mt-0.5 block">Across all departments</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] p-4 shadow-xs">
        <form method="GET" className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <input
              type="text"
              name="search"
              defaultValue={search || ""}
              placeholder="Search by name, email, ref..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-[#071a28] focus:outline-hidden focus:border-[#087fc3]"
            />
          </div>

          <div>
            <select
              name="department"
              defaultValue={department || ""}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-[#071a28] focus:outline-hidden focus:border-[#087fc3]"
            >
              <option value="">All Departments</option>
              <option value="SALES">Sales & CRM</option>
              <option value="LEGAL">Legal & Compliance</option>
              <option value="OPERATIONS">Operations</option>
              <option value="INVENTORY">Inventory & Plotting</option>
              <option value="MANAGEMENT">Management</option>
              <option value="MARKETING">Marketing</option>
            </select>
          </div>

          <div>
            <select
              name="status"
              defaultValue={status || ""}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-[#071a28] focus:outline-hidden focus:border-[#087fc3]"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INVITED">Invited</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="DEACTIVATED">Deactivated</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="w-full bg-[#071a28] text-white text-xs font-bold rounded-xl px-4 py-2 hover:bg-[#0c273c] transition-colors"
            >
              Filter
            </button>
            {(search || department || status || roleKey) && (
              <Link
                href="/dashboard/team"
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50"
              >
                Reset
              </Link>
            )}
          </div>
        </form>
      </div>

      {/* Member Table */}
      <TeamMemberTable
        members={JSON.parse(JSON.stringify(members))}
        total={total}
        page={page}
        perPage={perPage}
        userRole={session.user.role}
      />
    </div>
  );
}
