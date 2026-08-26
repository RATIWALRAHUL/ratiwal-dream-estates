import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/auth/customer-session";
import { PortalQueryService } from "@/lib/services/portal-query.service";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { PortalMobileNav } from "@/components/portal/PortalMobileNav";
import { PortalReceiptsView } from "@/components/portal/PortalReceiptsView";
import { PortalHomeSkeleton } from "@/components/portal/PortalSkeletons";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Payment Receipts | Ratiwal Customer Portal",
  description: "Download verified official payment acknowledgement receipts.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function PortalReceiptsPage() {
  const session = await getCustomerSession();
  if (!session) {
    redirect("/portal/login");
  }

  const data = await PortalQueryService.getCustomerPaymentData(session);

  return (
    <div className="min-h-screen bg-radial from-[#0c2438] via-[#071a28] to-[#040e17] text-slate-100 flex flex-col pb-16 md:pb-0">
      <PortalHeader user={session.user} />
      <main className="flex-1">
        <Suspense fallback={<PortalHomeSkeleton />}>
          <PortalReceiptsView receipts={data.receipts} />
        </Suspense>
      </main>
      <PortalMobileNav />
    </div>
  );
}
