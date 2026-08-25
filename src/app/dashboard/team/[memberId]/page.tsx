import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongoose";
import { TeamMember } from "@/models/TeamMember";
import { AuditLog } from "@/models/AuditLog";
import { TeamHandoverService } from "@/lib/services/team-handover.service";
import { MemberLifecycleActions } from "./MemberLifecycleActions";
import {
  ArrowLeft,
  Shield,
  Briefcase,
  Mail,
  Phone,
  Calendar,
  Layers,
  MapPin,
  Clock,
  Activity,
  KeyRound,
} from "lucide-react";

interface MemberDetailPageProps {
  params: Promise<{
    memberId: string;
  }>;
}

export const metadata = {
  title: "Member Profile | Ratiwal Dream Estates",
  description: "View team member profile, active responsibilities, and activity audit history.",
};

export default async function MemberDetailPage({ params }: MemberDetailPageProps) {
  const session = await getAdminSession();
  if (!session) redirect("/dashboard/login");

  const { memberId } = await params;
  await connectToDatabase();

  const member = await TeamMember.findById(memberId).lean();
  if (!member) {
    notFound();
  }

  const [activeWork, eligibleTargets, memberAuditLogs] = await Promise.all([
    TeamHandoverService.calculateMemberActiveWork(memberId),
    TeamMember.find({ _id: { $ne: member._id }, status: "ACTIVE" }).lean(),
    AuditLog.find({
      $or: [{ actorId: member._id.toString() }, { targetMemberId: member._id }],
    })
      .sort({ timestamp: -1 })
      .limit(10)
      .lean(),
  ]);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back Link & Header */}
      <div>
        <Link
          href="/dashboard/team"
          className="inline-flex items-center gap-1.5 text-xs text-[#647581] hover:text-[#071a28] font-bold mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Team Directory</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#087fc3] bg-[#087fc3]/10 px-2.5 py-0.5 rounded-full">
                {member.memberReference}
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                  member.status === "ACTIVE"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : member.status === "SUSPENDED"
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-slate-100 text-slate-600 border-slate-300"
                }`}
              >
                {member.status}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-[#071a28]">{member.fullName}</h1>
            <p className="text-xs text-[#647581] mt-0.5">
              {member.jobTitle} • {member.department} Department
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/dashboard/team/${memberId}/permissions`}
              className="px-4 py-2 rounded-xl border border-[rgba(7,26,40,0.12)] text-[#071a28] hover:bg-[#f8f7f4] text-xs font-bold flex items-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#087fc3]" />
              <span>Permissions & Scope</span>
            </Link>

            <MemberLifecycleActions
              member={JSON.parse(JSON.stringify(member))}
              activeWork={activeWork}
              eligibleTargetMembers={JSON.parse(JSON.stringify(eligibleTargets))}
              userRole={session.user.role}
            />
          </div>
        </div>
      </div>

      {/* Active Workload Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase text-[#647581] font-bold">Active CRM Leads</span>
            <Briefcase className="w-4 h-4 text-[#087fc3]" />
          </div>
          <div className="text-2xl font-bold text-[#071a28]">{activeWork.activeLeadsCount}</div>
          <span className="text-[10px] text-[#647581] mt-0.5 block">Prospective buyers assigned</span>
        </div>

        <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase text-[#647581] font-bold">Upcoming Site Visits</span>
            <Calendar className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-[#071a28]">{activeWork.upcomingSiteVisitsCount}</div>
          <span className="text-[10px] text-[#647581] mt-0.5 block">Scheduled property tours</span>
        </div>

        <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase text-[#647581] font-bold">Legal Document Reviews</span>
            <Shield className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-[#071a28]">{activeWork.pendingLegalReviewsCount}</div>
          <span className="text-[10px] text-[#647581] mt-0.5 block">Pending statutory verifications</span>
        </div>
      </div>

      {/* Member Details & Scopes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact & Organizational Details */}
        <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-[#071a28] pb-2 border-b border-[rgba(7,26,40,0.06)]">
            Account Profile & Identity
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#647581] flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Email Address
              </span>
              <span className="font-mono font-bold text-[#071a28]">{member.email}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#647581] flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> Phone
              </span>
              <span className="font-mono text-[#071a28]">{member.phoneMasked || "Not Provided"}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#647581] flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" /> Job Title
              </span>
              <span className="font-semibold text-[#071a28]">{member.jobTitle}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#647581]">Department</span>
              <span className="font-semibold text-[#071a28]">{member.department}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#647581]">Account Created</span>
              <span className="font-mono text-[#647581]">
                {new Date(member.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Security & Access Scope */}
        <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-[#071a28] pb-2 border-b border-[rgba(7,26,40,0.06)]">
            Role & Data Boundary
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#647581] flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> Assigned Role
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#071a28]/5 text-[#071a28] border border-[rgba(7,26,40,0.1)]">
                {member.roleKey.replace(/_/g, " ")}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#647581]">Data Scope</span>
              <span className="font-mono font-bold text-[#071a28]">{member.dataScope.replace(/_/g, " ")}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#647581]">Assigned Properties</span>
              <span className="font-mono text-[#071a28]">
                {member.assignedPropertyIds?.length || 0} Property Scopes
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#647581]">Assigned Locations</span>
              <span className="font-mono text-[#071a28]">
                {member.assignedLocationIds?.length || 0} Micro-markets
              </span>
            </div>

            {member.suspensionReason && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                <span className="font-bold block mb-1">Suspension Reason:</span>
                <p>{member.suspensionReason}</p>
              </div>
            )}

            {member.deactivationReason && (
              <div className="p-3 rounded-xl bg-slate-100 border border-slate-300 text-slate-700 text-xs">
                <span className="font-bold block mb-1">Deactivation Reason:</span>
                <p>{member.deactivationReason}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activity & Audit Trail */}
      <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs overflow-hidden">
        <div className="px-6 py-4 bg-[#f8f7f4] border-b border-[rgba(7,26,40,0.06)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#087fc3]" />
            <h3 className="font-bold text-sm text-[#071a28]">Audit Trail & Security Events</h3>
          </div>
          <span className="text-[10px] font-mono text-[#647581]">Last 10 mutations</span>
        </div>

        <div className="divide-y divide-[rgba(7,26,40,0.04)] font-mono text-xs">
          {memberAuditLogs.length === 0 ? (
            <div className="p-8 text-center text-[#647581] italic font-sans">
              No recent audit events recorded for this member.
            </div>
          ) : (
            memberAuditLogs.map((log: any) => (
              <div key={log._id} className="p-4 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-[#071a28]">{log.action}</span>
                    <span className="text-[10px] text-[#647581]">by {log.actorEmail}</span>
                  </div>
                  {log.reason && <p className="text-[#647581] font-sans text-xs">{log.reason}</p>}
                </div>
                <span className="text-[10px] text-[#647581] shrink-0">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
