import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongoose";
import { TeamInvitation } from "@/models/TeamInvitation";
import { InvitationActions } from "./InvitationActions";
import { TeamInviteButton } from "../TeamInviteButton";
import { ArrowLeft, Mail, Clock, Shield } from "lucide-react";

export const metadata = {
  title: "Team Invitations | Ratiwal Dream Estates",
  description: "Manage pending, accepted, and expired team invitations.",
};

export default async function TeamInvitationsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/dashboard/login");

  await connectToDatabase();

  const invitations = await TeamInvitation.find()
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/dashboard/team"
            className="inline-flex items-center gap-1.5 text-xs text-[#647581] hover:text-[#071a28] font-bold mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Team Directory</span>
          </Link>
          <h1 className="text-2xl font-bold text-[#071a28]">Team Invitations</h1>
          <p className="text-xs text-[#647581] mt-1">
            Track hashed one-time invitation links, manage resends, and revoke unauthorized invitations.
          </p>
        </div>

        <TeamInviteButton userRole={session.user.role} />
      </div>

      {/* Invitations Table */}
      <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#f8f7f4] border-b border-[rgba(7,26,40,0.06)] text-[10px] font-mono uppercase tracking-wider text-[#647581]">
                <th className="py-3 px-4">Recipient</th>
                <th className="py-3 px-4">Role & Scope</th>
                <th className="py-3 px-4">Invited By</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Expires At</th>
                <th className="py-3 px-4">Resends</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(7,26,40,0.04)] font-mono text-xs">
              {invitations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-[#647581] italic font-sans">
                    No team invitations found. Click &quot;Invite Member&quot; to generate an invitation link.
                  </td>
                </tr>
              ) : (
                invitations.map((inv: any) => {
                  const isExpired = new Date(inv.expiresAt).getTime() < Date.now() && inv.status === "INVITED";
                  const displayStatus = isExpired ? "EXPIRED" : inv.status;

                  return (
                    <tr key={inv._id} className="hover:bg-[#f8f7f4]/60 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-bold text-[#071a28] block font-sans">{inv.fullName}</span>
                        <span className="text-[10px] text-[#647581] font-mono block">{inv.email}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#071a28]/5 text-[#071a28] border border-[rgba(7,26,40,0.1)]">
                          {inv.roleKey.replace(/_/g, " ")}
                        </span>
                        <span className="text-[10px] text-[#647581] block mt-0.5">{inv.dataScope}</span>
                      </td>

                      <td className="py-3 px-4 text-[#647581] font-sans">
                        {inv.invitedByName || inv.invitedBy}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                            displayStatus === "ACCEPTED"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : displayStatus === "INVITED"
                              ? "bg-sky-50 text-sky-700 border-sky-200"
                              : displayStatus === "REVOKED"
                              ? "bg-gray-100 text-gray-600 border-gray-300"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          {displayStatus}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-[#647581] font-mono text-[11px]">
                        {new Date(inv.expiresAt).toLocaleString()}
                      </td>

                      <td className="py-3 px-4 text-[#647581] font-mono text-[11px]">
                        {inv.resendCount}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <InvitationActions
                          invitationId={inv._id.toString()}
                          email={inv.email}
                          status={displayStatus}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
