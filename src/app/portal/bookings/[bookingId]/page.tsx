import React, { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/auth/customer-session";
import { PortalQueryService } from "@/lib/services/portal-query.service";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { PortalMobileNav } from "@/components/portal/PortalMobileNav";
import { PortalBookingDetailsView } from "@/components/portal/PortalBookingDetailsView";
import { PortalCardSkeleton } from "@/components/portal/PortalSkeletons";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Booking Details | Ratiwal Customer Portal",
  description: "Detailed operational booking and milestone conveyance records.",
  robots: {
    index: false,
    follow: false,
  },
};

interface PortalBookingDetailPageProps {
  params: Promise<{ bookingId: string }>;
}

export default async function PortalBookingDetailPage({ params }: PortalBookingDetailPageProps) {
  const session = await getCustomerSession();
  if (!session) {
    redirect("/portal/login");
  }

  const { bookingId } = await params;

  try {
    const data = await PortalQueryService.getCustomerBookingDetails(session, bookingId);

    return (
      <div className="min-h-screen bg-radial from-[#0c2438] via-[#071a28] to-[#040e17] text-slate-100 flex flex-col pb-16 md:pb-0">
        <PortalHeader user={session.user} />
        <main className="flex-1">
          <Suspense fallback={<PortalCardSkeleton />}>
            <PortalBookingDetailsView data={data} />
          </Suspense>
        </main>
        <PortalMobileNav />
      </div>
    );
  } catch {
    notFound();
  }
}
