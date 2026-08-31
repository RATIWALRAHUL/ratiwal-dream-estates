import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/session";
import { SettingsService } from "@/lib/services/settings.service";
import { SettingsSectionNav } from "@/components/dashboard/settings/SettingsSectionNav";
import { IntegrationStatusCards } from "@/components/dashboard/settings/IntegrationStatusCards";
import { Lock } from "lucide-react";

export const metadata = {
  title: "Integrations Health | Ratiwal Dream Estates",
  description: "Read-only integration status and service connectivity monitor.",
};

export default async function IntegrationsSettingsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/dashboard/login");

  const statuses = SettingsService.getIntegrationStatuses();

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#087fc3] bg-[#087fc3]/10 px-2.5 py-0.5 rounded-full">
            PRD 10 • External Connectivity
          </span>
        </div>
        <h1 className="text-2xl font-bold text-[#071a28]">Integration Services & Connectivity Health</h1>
        <p className="text-xs text-[#647581] mt-1">
          Inspect cloud provider connection statuses. Secret credentials and API keys are automatically redacted.
        </p>
      </div>

      <SettingsSectionNav />

      {/* Secret Safety Banner */}
      <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-sky-900 text-xs flex items-start gap-3">
        <Lock className="w-4 h-4 text-[#087fc3] shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block mb-0.5">Zero Secret Exposure Architecture</span>
          <p className="text-sky-800">
            For maximum enterprise security, external API credentials (Resend keys, ImageKit secrets, MongoDB connection strings) are loaded strictly through server environment variables and are never transmitted to or displayed in the browser.
          </p>
        </div>
      </div>

      <IntegrationStatusCards statuses={statuses} />
    </div>
  );
}
