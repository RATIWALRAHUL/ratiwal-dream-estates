import "server-only";
import { KycInitiateForm } from "@/components/dashboard/kyc/KycInitiateForm";
import { Property } from "@/models/Property";
import { Deal } from "@/models/Deal";
import { KycRequirementTemplate } from "@/models/KycRequirementTemplate";
import { KycTemplateService } from "@/lib/services/kyc-template.service";

export const metadata = {
  title: "Initiate KYC Case | Admin Dashboard",
  description: "Create a new customer identity verification case.",
};

export default async function NewKycCasePage() {
  await KycTemplateService.seedDefaultTemplates();

  const [properties, deals, templates] = await Promise.all([
    Property.find({ status: { $ne: "ARCHIVED" } }).select("title slug code").lean(),
    Deal.find({ status: { $nin: ["WON", "LOST", "CANCELLED", "ARCHIVED"] } })
      .populate("leadId", "fullName displayPhone")
      .select("dealNumber status pipelineStage leadId")
      .lean(),
    KycRequirementTemplate.find({ status: "ACTIVE" }).select("templateKey name version partyType").lean(),
  ]);

  return (
    <KycInitiateForm
      properties={properties}
      deals={deals}
      templates={templates}
    />
  );
}
