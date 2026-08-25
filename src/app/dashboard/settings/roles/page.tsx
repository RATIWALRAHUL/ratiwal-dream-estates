import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Role } from "@/models/Role";
import { TeamMember } from "@/models/TeamMember";
import { PermissionService } from "@/lib/services/permission.service";
import { SettingsSectionNav } from "@/components/dashboard/settings/SettingsSectionNav";
import { PermissionMatrix } from "@/components/dashboard/settings/PermissionMatrix";
import { Shield, KeyRound, Plus, Lock, Users, Sparkles } from "lucide-react";

export const metadata = {
  title: "Roles & Permissions | Ratiwal Dream Estates",
  description: "Inspect protected system roles and manage custom permission roles.",
};

export default async function RolesSettingsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/dashboard/login");

  await connectToDatabase();
  await PermissionService.seedSystemRoles(session.user.id);

  const [roles, memberCounts] = await Promise.all([
    Role.find().sort({ roleType: 1, createdAt: 1 }).lean(),
    TeamMember.aggregate([
      { $match: { status: "ACTIVE" } },
      { $group: { _id: "$roleKey", count: { $sum: 1 } } },
    ]),
  ]);

  const memberCountMap: Record<string, number> = {};
  for (const item of memberCounts) {
    memberCountMap[item._id] = item.count;
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#087fc3] bg-[#087fc3]/10 px-2.5 py-0.5 rounded-full">
              PRD 10 • Access Control
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#071a28]">Roles & Permission Matrix</h1>
          <p className="text-xs text-[#647581] mt-1">
            Review immutable system roles, build custom permission bundles, and audit module scopes.
          </p>
        </div>

        <Link
          href="/dashboard/settings/roles/new"
          className="px-4 py-2.5 rounded-xl bg-[#087fc3] text-white text-xs font-bold hover:bg-[#076fa8] shadow-xs flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Custom Role</span>
        </Link>
      </div>

      <SettingsSectionNav />

      {/* Role Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles.map((role: any) => {
          const count = memberCountMap[role.roleKey] || 0;

          return (
            <div
              key={role._id}
              className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between ${
                role.isSystemRole
                  ? "border-[rgba(7,26,40,0.08)]"
                  : "border-sky-200 bg-linear-to-b from-white to-sky-50/20"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-bold text-sm text-[#071a28] flex items-center gap-2">
                      <span>{role.displayName}</span>
                      {role.isSystemRole ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          <Lock className="w-2.5 h-2.5" /> SYSTEM
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                          <Sparkles className="w-2.5 h-2.5" /> CUSTOM
                        </span>
                      )}
                    </h3>
                    <code className="text-[10px] font-mono text-[#647581]">{role.roleKey}</code>
                  </div>

                  <span className="inline-flex items-center gap-1 text-xs font-mono text-[#647581] bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-100">
                    <Users className="w-3 h-3" />
                    <strong>{count}</strong> Active
                  </span>
                </div>

                <p className="text-xs text-[#647581] mb-4">{role.description}</p>
              </div>

              <div className="pt-3 border-t border-[rgba(7,26,40,0.06)] flex items-center justify-between text-xs">
                <span className="text-[11px] font-mono font-bold text-[#087fc3]">
                  {role.permissionKeys?.length || 0} Granted Permissions
                </span>
                <span className="text-[10px] font-mono text-[#647581]">
                  Scope: {role.defaultDataScope}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Global Permission Catalogue Breakdown */}
      <div className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-base text-[#071a28]">Global Permission Catalogue</h3>
            <p className="text-xs text-[#647581]">
              Central directory of all 42 discrete permission gates across 14 modules.
            </p>
          </div>
        </div>

        <PermissionMatrix readOnly={true} />
      </div>
    </div>
  );
}
