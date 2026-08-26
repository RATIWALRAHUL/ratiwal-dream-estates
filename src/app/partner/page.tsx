import { redirect } from "next/navigation";
import { getPartnerSession } from "@/lib/auth/partner-session";
import { PartnerQueryService } from "@/lib/services/partner-query.service";
import { PartnerHomeView } from "@/components/partner/PartnerHomeView";

export const dynamic = "force-dynamic";

export default async function PartnerDashboardPage() {
  const session = await getPartnerSession();
  if (!session) {
    redirect("/partner/login");
  }

  const data = await PartnerQueryService.getPartnerPortalOverview(session);

  return <PartnerHomeView data={data} />;
}
