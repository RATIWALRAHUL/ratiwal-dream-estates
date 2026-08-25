import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongoose";
import { SettingsChange } from "@/models/SettingsChange";
import { SettingsSectionNav } from "@/components/dashboard/settings/SettingsSectionNav";
import { SettingsRollbackButton } from "./SettingsRollbackButton";
import { History, RotateCcw, User } from "lucide-react";

export const metadata = {
  title: "Settings Change History | Ratiwal Dream Estates",
  description: "Inspect immutable audit log of settings modifications and perform safe rollbacks.",
};

export default async function SettingsHistoryPage() {
  const session = await getAdminSession();
  if (!session) redirect("/dashboard/login");

  await connectToDatabase();

  const changes = await SettingsChange.find()
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#087fc3] bg-[#087fc3]/10 px-2.5 py-0.5 rounded-full">
            PRD 10 • Version History
          </span>
        </div>
        <h1 className="text-2xl font-bold text-[#071a28]">Settings Revision History & Rollbacks</h1>
        <p className="text-xs text-[#647581] mt-1">
          Immutable audit record of all configuration mutations with previous and current snapshots.
        </p>
      </div>

      <SettingsSectionNav />

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#f8f7f4] border-b border-[rgba(7,26,40,0.06)] text-[10px] font-mono uppercase tracking-wider text-[#647581]">
                <th className="py-3 px-4">Section & Reason</th>
                <th className="py-3 px-4">Changed Keys</th>
                <th className="py-3 px-4">Version</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(7,26,40,0.04)] font-mono text-xs">
              {changes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-[#647581] italic font-sans">
                    No settings change history recorded yet.
                  </td>
                </tr>
              ) : (
                changes.map((change: any) => (
                  <tr key={change._id} className="hover:bg-[#f8f7f4]/60 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-bold text-[#071a28] block font-sans flex items-center gap-1.5">
                        {change.isRollback && (
                          <RotateCcw className="w-3 h-3 text-amber-600 shrink-0" />
                        )}
                        <span>{change.settingsSection} Section</span>
                      </span>
                      <span className="text-[10px] text-[#647581] font-sans block">
                        {change.reason || "Configuration update"}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-[#647581]">
                      {change.changedFieldKeys?.length > 0
                        ? change.changedFieldKeys.join(", ")
                        : "All section fields"}
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#071a28]/5 text-[#071a28]">
                        v{change.versionBefore} → v{change.versionAfter}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-[#647581] font-sans">
                      <span className="block font-semibold text-[#071a28]">{change.actorEmail}</span>
                    </td>

                    <td className="py-3 px-4 text-[#647581] font-mono text-[11px]">
                      {new Date(change.createdAt).toLocaleString()}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {session.user.role === "SUPER_ADMIN" && !change.isRollback && (
                        <SettingsRollbackButton
                          changeId={change._id.toString()}
                          section={change.settingsSection}
                          versionBefore={change.versionBefore}
                        />
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
