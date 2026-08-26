import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/auth/customer-session";
import { PortalQueryService } from "@/lib/services/portal-query.service";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { PortalMobileNav } from "@/components/portal/PortalMobileNav";
import { PortalBookingsListView } from "@/components/portal/PortalBookingsListView";
import { PortalHomeSkeleton } from "@/components/portal/PortalSkeletons";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Bookings | Ratiwal Customer Portal",
  description: "View all property plot bookings and conveyance milestones.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function PortalBookingsPage() {
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
          <PortalBookingsListView bookings={data.bookings} />
        </Suspense>
      </main>
      <PortalMobileNav />
    </div>
  );
}
