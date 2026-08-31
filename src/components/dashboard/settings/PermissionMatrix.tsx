import { PERMISSION_CATALOGUE, SYSTEM_MODULES, PermissionDefinition } from "@/types/settings-team";
import { AlertTriangle } from "lucide-react";

interface PermissionMatrixProps {
  selectedKeys?: string[];
  readOnly?: boolean;
  onToggleKey?: (key: string) => void;
}

const RISK_BADGES = {
  LOW: { bg: "bg-slate-100", text: "text-slate-600" },
  MEDIUM: { bg: "bg-sky-50", text: "text-sky-700" },
  HIGH: { bg: "bg-amber-50", text: "text-amber-700" },
  CRITICAL: { bg: "bg-rose-50", text: "text-rose-700" },
};

export function PermissionMatrix({
  selectedKeys = [],
  readOnly = false,
  onToggleKey,
}: PermissionMatrixProps) {
  const selectedSet = new Set(selectedKeys);

  // Group permissions by module
  const grouped: Record<string, PermissionDefinition[]> = {};
  for (const mod of SYSTEM_MODULES) {
    grouped[mod] = [];
  }
  for (const perm of Object.values(PERMISSION_CATALOGUE)) {
    if (grouped[perm.module]) {
      grouped[perm.module].push(perm);
    }
  }

  return (
    <div className="space-y-6">
      {SYSTEM_MODULES.map((mod) => {
        const perms = grouped[mod];
        if (!perms || perms.length === 0) return null;

        return (
          <div key={mod} className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] overflow-hidden shadow-xs">
            <div className="bg-[#f8f7f4] px-5 py-3 border-b border-[rgba(7,26,40,0.06)] flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[#071a28] uppercase tracking-wider">
                {mod.replace(/_/g, " ")} MODULE
              </span>
              <span className="text-[10px] font-mono text-[#647581]">{perms.length} Permissions</span>
            </div>

            <div className="divide-y divide-[rgba(7,26,40,0.04)]">
              {perms.map((perm) => {
                const isChecked = selectedSet.has(perm.key);
                const risk = RISK_BADGES[perm.riskLevel];

                return (
                  <div
                    key={perm.key}
                    className="p-4 flex items-start gap-4 hover:bg-[#f8f7f4]/40 transition-colors"
                  >
                    {!readOnly && onToggleKey && (
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => onToggleKey(perm.key)}
                        className="mt-1 rounded text-[#087fc3] focus:ring-[#087fc3]"
                      />
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-bold text-[#071a28]">{perm.displayName}</span>
                        <code className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {perm.key}
                        </code>
                        <span
                          className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${risk.bg} ${risk.text}`}
                        >
                          {perm.riskLevel} RISK
                        </span>
                      </div>

                      <p className="text-xs text-[#647581]">{perm.description}</p>

                      {perm.dependencies.length > 0 && (
                        <div className="mt-2 flex items-center gap-1.5 text-[10px] font-mono text-amber-700">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          <span>Requires: {perm.dependencies.join(", ")}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
