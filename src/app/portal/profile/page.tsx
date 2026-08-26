import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/auth/customer-session";
import { PortalQueryService } from "@/lib/services/portal-query.service";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { PortalMobileNav } from "@/components/portal/PortalMobileNav";
import { PortalProfileView } from "@/components/portal/PortalProfileView";
import { PortalHomeSkeleton } from "@/components/portal/PortalSkeletons";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Profile & Preferences | Ratiwal Customer Portal",
  description: "Manage customer profile, contact details, and communication channels.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function PortalProfilePage() {
  const session = await getCustomerSession();
  if (!session) {
    redirect("/portal/login");
  }

  const profile = await PortalQueryService.getCustomerProfile(session);

  return (
    <div className="min-h-screen bg-radial from-[#0c2438] via-[#071a28] to-[#040e17] text-slate-100 flex flex-col pb-16 md:pb-0">
      <PortalHeader user={session.user} />
      <main className="flex-1">
        <Suspense fallback={<PortalHomeSkeleton />}>
          <PortalProfileView profile={profile} />
        </Suspense>
      </main>
      <PortalMobileNav />
    </div>
  );
}
