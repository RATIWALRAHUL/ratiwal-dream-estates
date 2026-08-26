import "server-only";
import { KycRequirementTemplate } from "@/models/KycRequirementTemplate";
import { KycRetentionPolicy } from "@/models/KycRetentionPolicy";
import { KycTemplateService } from "@/lib/services/kyc-template.service";
import { KycRetentionService } from "@/lib/services/kyc-retention.service";
import { KycSettingsView } from "@/components/dashboard/kyc/KycSettingsView";

export const metadata = {
  title: "KYC Settings & Governance | Admin Dashboard",
  description: "Configure requirement templates, retention rules, and legal holds.",
};

export default async function KycSettingsPage() {
  await Promise.all([
    KycTemplateService.seedDefaultTemplates(),
    KycRetentionService.seedRetentionPolicies(),
  ]);

  const [templates, retentionPolicies] = await Promise.all([
    KycRequirementTemplate.find().sort({ templateKey: 1 }).lean(),
    KycRetentionPolicy.find().sort({ category: 1 }).lean(),
  ]);

  return (
    <KycSettingsView
      templates={templates}
      retentionPolicies={retentionPolicies}
    />
  );
}
