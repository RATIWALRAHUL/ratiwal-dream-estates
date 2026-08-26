import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/auth/customer-session";
import { PortalQueryService } from "@/lib/services/portal-query.service";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { PortalMobileNav } from "@/components/portal/PortalMobileNav";
import { PortalRefundsView } from "@/components/portal/PortalRefundsView";
import { PortalHomeSkeleton } from "@/components/portal/PortalSkeletons";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Refunds & Settlement Claims | Ratiwal Customer Portal",
  description: "Submit and track customer payment refund requests.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function PortalRefundsPage() {
  const session = await getCustomerSession();
  if (!session) {
    redirect("/portal/login");
  }

  const data = await PortalQueryService.getCustomerPaymentData(session);

  const eligiblePayments = data.transactions.filter(
    (t: any) => t.status === "CAPTURED" && (t.refundedAmountPaise || 0) < (t.capturedAmountPaise || t.amountPaise)
  );

  return (
    <div className="min-h-screen bg-radial from-[#0c2438] via-[#071a28] to-[#040e17] text-slate-100 flex flex-col pb-16 md:pb-0">
      <PortalHeader user={session.user} />
      <main className="flex-1">
        <Suspense fallback={<PortalHomeSkeleton />}>
          <PortalRefundsView refunds={data.refunds} eligiblePayments={eligiblePayments} />
        </Suspense>
      </main>
      <PortalMobileNav />
    </div>
  );
}
