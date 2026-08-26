import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/auth/customer-session";
import { PortalQueryService } from "@/lib/services/portal-query.service";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { PortalMobileNav } from "@/components/portal/PortalMobileNav";
import { PortalSiteVisitsView } from "@/components/portal/PortalSiteVisitsView";
import { PortalHomeSkeleton } from "@/components/portal/PortalSkeletons";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Site Visits | Ratiwal Customer Portal",
  description: "Schedule and manage private on-site plot visits.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function PortalSiteVisitsPage() {
  const session = await getCustomerSession();
  if (!session) {
    redirect("/portal/login");
  }

  const data = await PortalQueryService.getPortalHomeData(session);

  return (
    <div className="min-h-screen bg-radial from-[#0c2438] via-[#071a28] to-[#040e17] text-slate-100 flex flex-col pb-16 md:pb-0">
      <PortalHeader user={session.user} />
      <main className="flex-1">
        <Suspense fallback={<PortalHomeSkeleton />}>
          <PortalSiteVisitsView siteVisits={data.upcomingSiteVisits} />
        </Suspense>
      </main>
      <PortalMobileNav />
    </div>
  );
}
