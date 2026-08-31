"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, AlertCircle, Save } from "lucide-react";
import { updateTeamMemberAction } from "@/lib/actions/team.actions";
import { PermissionMatrix } from "@/components/dashboard/settings/PermissionMatrix";
import { DATA_SCOPES, DataScope } from "@/types/settings-team";

interface MemberPermissionsEditorProps {
  member: any;
  effectivePermissions: string[];
  rolesList: any[];
  userRole: string;
}

export function MemberPermissionsEditor({
  member,
  effectivePermissions,
  rolesList,
  userRole,
}: MemberPermissionsEditorProps) {
  const router = useRouter();
  const [roleKey, setRoleKey] = useState(member.roleKey);
  const [dataScope, setDataScope] = useState<DataScope>(member.dataScope);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const res = await updateTeamMemberAction({
      memberId: member._id,
      currentVersion: member.version,
      roleKey,
      dataScope,
    });

    setIsLoading(false);

    if (res.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      router.refresh();
    } else {
      setError(res.message || "Failed to update member permissions.");
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Member role and data scope updated successfully!</span>
        </div>
      )}

      {/* Role & Scope Selector */}
      <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-[#071a28]">Access Role & Scoped Isolation</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#071a28] mb-1.5 font-mono uppercase">
              Assigned Role
            </label>
            <select
              value={roleKey}
              onChange={(e) => setRoleKey(e.target.value)}
              className="w-full text-xs bg-white border border-[rgba(7,26,40,0.12)] rounded-xl px-3.5 py-2.5 text-[#071a28] focus:outline-hidden focus:border-[#087fc3]"
            >
              {rolesList.map((r) => (
                <option
                  key={r.roleKey}
                  value={r.roleKey}
                  disabled={r.roleKey === "SUPER_ADMIN" && userRole !== "SUPER_ADMIN"}
                >
                  {r.displayName} ({r.roleKey})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#071a28] mb-1.5 font-mono uppercase">
              Data Boundary Scope
            </label>
            <select
              value={dataScope}
              onChange={(e) => setDataScope(e.target.value as DataScope)}
              className="w-full text-xs bg-white border border-[rgba(7,26,40,0.12)] rounded-xl px-3.5 py-2.5 text-[#071a28] focus:outline-hidden focus:border-[#087fc3]"
            >
              {DATA_SCOPES.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-3 border-t border-[rgba(7,26,40,0.06)] flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl bg-[#087fc3] text-white text-xs font-bold hover:bg-[#076fa8] shadow-xs flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isLoading ? "Saving Changes..." : "Save Role & Scope"}</span>
          </button>
        </div>
      </div>

      {/* Effective Permission Matrix */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm text-[#071a28]">Effective Granted Permissions</h3>
          <span className="text-xs font-mono text-[#647581]">
            {effectivePermissions.length} Active Permissions
          </span>
        </div>

        <PermissionMatrix selectedKeys={effectivePermissions} readOnly={true} />
      </div>
    </div>
  );
}
