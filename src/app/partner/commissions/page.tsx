import { redirect } from "next/navigation";
import { getPartnerSession } from "@/lib/auth/partner-session";
import { PartnerQueryService } from "@/lib/services/partner-query.service";
import { PartnerCommissionsView } from "@/components/partner/PartnerCommissionsView";

export const dynamic = "force-dynamic";

export default async function PartnerCommissionsPage() {
  const session = await getPartnerSession();
  if (!session) {
    redirect("/partner/login");
  }

  const commissions = await PartnerQueryService.getPartnerCommissions(session);

  return <PartnerCommissionsView commissions={commissions} />;
}
