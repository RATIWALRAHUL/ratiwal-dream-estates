import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/session";
import { SettingsService } from "@/lib/services/settings.service";
import { SettingsSectionNav } from "@/components/dashboard/settings/SettingsSectionNav";
import { BusinessSettingsForm } from "./BusinessSettingsForm";

export const metadata = {
  title: "Business & CRM Settings | Ratiwal Dream Estates",
  description: "Configure lead assignment SLAs, site-visit notice windows, and legal compliance policies.",
};

export default async function BusinessSettingsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/dashboard/login");

  const settings = await SettingsService.getSettings();

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#087fc3] bg-[#087fc3]/10 px-2.5 py-0.5 rounded-full">
            PRD 10 • Operations & SLAs
          </span>
          <span className="text-[10px] font-mono text-[#647581]">
            Version {settings.settingsVersion}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-[#071a28]">CRM Rules, Site Visits & Legal Vault Policies</h1>
        <p className="text-xs text-[#647581] mt-1">
          Tune response time SLA targets, lead distribution rules, visit advance notices, and legal upload limits.
        </p>
      </div>

      <SettingsSectionNav />

      <BusinessSettingsForm initialSettings={JSON.parse(JSON.stringify(settings))} />
    </div>
  );
}
