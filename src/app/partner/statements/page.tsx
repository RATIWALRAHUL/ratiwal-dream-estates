import { redirect } from "next/navigation";
import { getPartnerSession } from "@/lib/auth/partner-session";
import { PartnerQueryService } from "@/lib/services/partner-query.service";
import { PartnerStatementsView } from "@/components/partner/PartnerStatementsView";

export const dynamic = "force-dynamic";

export default async function PartnerStatementsPage() {
  const session = await getPartnerSession();
  if (!session) {
    redirect("/partner/login");
  }

  const statements = await PartnerQueryService.getPartnerStatements(session);

  return <PartnerStatementsView statements={statements} />;
}
