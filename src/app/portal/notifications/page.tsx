import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/auth/customer-session";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { PortalMobileNav } from "@/components/portal/PortalMobileNav";
import { PortalNotificationsView } from "@/components/portal/PortalNotificationsView";
import { PortalHomeSkeleton } from "@/components/portal/PortalSkeletons";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Notifications | Ratiwal Customer Portal",
  description: "Recent updates, receipts, and conveyance alerts.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function PortalNotificationsPage() {
  const session = await getCustomerSession();
  if (!session) {
    redirect("/portal/login");
  }

  return (
    <div className="min-h-screen bg-radial from-[#0c2438] via-[#071a28] to-[#040e17] text-slate-100 flex flex-col pb-16 md:pb-0">
      <PortalHeader user={session.user} />
      <main className="flex-1">
        <Suspense fallback={<PortalHomeSkeleton />}>
          <PortalNotificationsView />
        </Suspense>
      </main>
      <PortalMobileNav />
    </div>
  );
}
