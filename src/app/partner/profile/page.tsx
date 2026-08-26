import { redirect } from "next/navigation";
import { getPartnerSession } from "@/lib/auth/partner-session";
import { PartnerQueryService } from "@/lib/services/partner-query.service";
import { PartnerProfileView } from "@/components/partner/PartnerProfileView";

export const dynamic = "force-dynamic";

export default async function PartnerProfilePage() {
  const session = await getPartnerSession();
  if (!session) {
    redirect("/partner/login");
  }

  const profile = await PartnerQueryService.getPartnerProfile(session);

  return <PartnerProfileView profile={profile} />;
}
