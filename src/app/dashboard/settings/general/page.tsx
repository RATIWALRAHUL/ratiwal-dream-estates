import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/session";
import { SettingsService } from "@/lib/services/settings.service";
import { SettingsSectionNav } from "@/components/dashboard/settings/SettingsSectionNav";
import { GeneralSettingsForm } from "./GeneralSettingsForm";

export const metadata = {
  title: "General Settings | Ratiwal Dream Estates",
  description: "Configure organization identity, legal registration, and contact details.",
};

export default async function GeneralSettingsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/dashboard/login");

  const settings = await SettingsService.getSettings();

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#087fc3] bg-[#087fc3]/10 px-2.5 py-0.5 rounded-full">
            PRD 10 • System Settings
          </span>
          <span className="text-[10px] font-mono text-[#647581]">
            Version {settings.settingsVersion}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-[#071a28]">Organization Profile & General Settings</h1>
        <p className="text-xs text-[#647581] mt-1">
          Configure verified business credentials, official support lines, and corporate identity.
        </p>
      </div>

      <SettingsSectionNav />

      <GeneralSettingsForm initialSettings={JSON.parse(JSON.stringify(settings))} />
    </div>
  );
}
