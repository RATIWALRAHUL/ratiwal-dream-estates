import { redirect } from "next/navigation";
import { getPartnerSession } from "@/lib/auth/partner-session";
import { PartnerGuard } from "@/lib/auth/partner-guard";
import { PartnerPropertyAccess } from "@/models/PartnerPropertyAccess";

import { connectToDatabase } from "@/lib/db/mongoose";
import { PartnerLeadForm } from "@/components/partner/PartnerLeadForm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function NewPartnerLeadPage({
  searchParams,
}: {
  searchParams: Promise<{ propertyId?: string }>;
}) {
  const session = await getPartnerSession();
  if (!session) {
    redirect("/partner/login");
  }

  const resolvedParams = await searchParams;
  const scope = await PartnerGuard.resolvePartnerScope(session);
  await connectToDatabase();

  const grants = await PartnerPropertyAccess.find({
    partnerId: scope.partnerId,
    isActive: true,
  }).populate("propertyId", "title").lean();

  const properties = grants
    .filter((g: any) => g.propertyId)
    .map((g: any) => ({
      id: g.propertyId._id.toString(),
      title: g.propertyId.title,
    }));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link href="/partner/leads" className="text-xs text-amber-400 hover:underline flex items-center space-x-1 mb-2">
          <span>← Back to Lead Pipeline</span>
        </Link>
        <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
          Register Prospective Buyer
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Lock in your 60-day attribution window. Our senior sales team will coordinate seamless site visits with zero broker interference.
        </p>
      </div>

      <PartnerLeadForm
        properties={properties}
        preselectedPropertyId={resolvedParams.propertyId}
      />
    </div>
  );
}
