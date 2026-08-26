import { redirect } from "next/navigation";
import { getPartnerSession } from "@/lib/auth/partner-session";
import { PartnerQueryService } from "@/lib/services/partner-query.service";
import { PartnerDocumentsView } from "@/components/partner/PartnerDocumentsView";

export const dynamic = "force-dynamic";

export default async function PartnerDocumentsPage() {
  const session = await getPartnerSession();
  if (!session) {
    redirect("/partner/login");
  }

  const profile = await PartnerQueryService.getPartnerProfile(session);

  return <PartnerDocumentsView profile={profile} />;
}
