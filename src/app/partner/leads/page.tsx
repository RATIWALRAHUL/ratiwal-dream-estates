import { redirect } from "next/navigation";
import { getPartnerSession } from "@/lib/auth/partner-session";
import { PartnerQueryService } from "@/lib/services/partner-query.service";
import { PartnerLeadsView } from "@/components/partner/PartnerLeadsView";

export const dynamic = "force-dynamic";

export default async function PartnerLeadsPage() {
  const session = await getPartnerSession();
  if (!session) {
    redirect("/partner/login");
  }

  const leads = await PartnerQueryService.getPartnerLeads(session);

  return <PartnerLeadsView leads={leads} />;
}
