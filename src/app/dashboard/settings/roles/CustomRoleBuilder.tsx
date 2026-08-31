"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, AlertCircle } from "lucide-react";
import { createCustomRoleAction } from "@/lib/actions/settings.actions";
import { PermissionMatrix } from "@/components/dashboard/settings/PermissionMatrix";
import { DATA_SCOPES, DataScope, validatePermissionDependencies } from "@/types/settings-team";

export function CustomRoleBuilder() {
  const router = useRouter();
  const [roleKey, setRoleKey] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const [defaultDataScope, setDefaultDataScope] = useState<DataScope>("ALL_ORGANIZATION");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([
    "DASHBOARD_VIEW",
    "PROPERTIES_VIEW",
    "LOCATIONS_VIEW",
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggleKey = (key: string) => {
    if (selectedPermissions.includes(key)) {
      setSelectedPermissions(selectedPermissions.filter((k) => k !== key));
    } else {
      setSelectedPermissions([...selectedPermissions, key]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate dependencies
    const depCheck = validatePermissionDependencies(selectedPermissions);
    if (!depCheck.isValid) {
      setError(
        `Dependency error: ${depCheck.missingDependencies
          .map((d) => `"${d.permission}" requires "${d.requires}"`)
          .join(", ")}`
      );
      return;
    }

    setIsLoading(true);

    const res = await createCustomRoleAction({
      roleKey,
      displayName,
      description,
      permissionKeys: selectedPermissions,
      defaultDataScope,
    });

    setIsLoading(false);

    if (res.success) {
      router.push("/dashboard/settings/roles");
    } else {
      setError(res.message || "Failed to create custom role.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Role Metadata Card */}
      <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-[#071a28] pb-2 border-b border-[rgba(7,26,40,0.06)]">
          Custom Role Metadata
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#071a28] mb-1.5">Role Display Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Senior Area Sales Head"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                if (!roleKey) {
                  setRoleKey(
                    e.target.value
                      .toUpperCase()
                      .replace(/[^A-Z0-9]/g, "_")
                      .replace(/_+/g, "_")
                  );
                }
              }}
              className="w-full text-xs bg-white border border-[rgba(7,26,40,0.12)] rounded-xl px-3.5 py-2.5 text-[#071a28] focus:outline-hidden focus:border-[#087fc3]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#071a28] mb-1.5">Stable Role Key *</label>
            <input
              type="text"
              required
              placeholder="e.g. AREA_SALES_HEAD"
              value={roleKey}
              onChange={(e) => setRoleKey(e.target.value.toUpperCase())}
              className="w-full text-xs font-mono bg-white border border-[rgba(7,26,40,0.12)] rounded-xl px-3.5 py-2.5 text-[#071a28] focus:outline-hidden focus:border-[#087fc3]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-[#071a28] mb-1.5">Role Description *</label>
            <input
              type="text"
              required
              placeholder="e.g. Regional manager responsible for Jaipur North township sales and advisor oversight."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs bg-white border border-[rgba(7,26,40,0.12)] rounded-xl px-3.5 py-2.5 text-[#071a28] focus:outline-hidden focus:border-[#087fc3]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#071a28] mb-1.5">Default Data Scope</label>
            <select
              value={defaultDataScope}
              onChange={(e) => setDefaultDataScope(e.target.value as DataScope)}
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
      </div>

      {/* Permission Checklist */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-sm text-[#071a28]">Select Granted Permissions</h3>
            <p className="text-xs text-[#647581]">
              Check the permissions to include in this custom role. Dependencies will be validated.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-[#087fc3]">
            {selectedPermissions.length} Permissions Selected
          </span>
        </div>

        <PermissionMatrix
          selectedKeys={selectedPermissions}
          readOnly={false}
          onToggleKey={handleToggleKey}
        />
      </div>

      <div className="pt-2 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] text-[#071a28] text-xs font-bold hover:bg-slate-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2.5 rounded-xl bg-[#087fc3] text-white text-xs font-bold hover:bg-[#076fa8] shadow-xs flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isLoading ? "Creating Role..." : "Create Custom Role"}</span>
        </button>
      </div>
    </form>
  );
}
