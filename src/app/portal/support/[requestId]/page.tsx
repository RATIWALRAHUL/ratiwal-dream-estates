import React, { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/auth/customer-session";
import { PortalGuard } from "@/lib/auth/portal-guard";
import { connectToDatabase } from "@/lib/db/mongoose";
import { CustomerSupportRequest } from "@/models/CustomerSupportRequest";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { PortalMobileNav } from "@/components/portal/PortalMobileNav";
import { PortalSupportDetailView } from "@/components/portal/PortalSupportDetailView";
import { PortalCardSkeleton } from "@/components/portal/PortalSkeletons";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Ticket Conversation | Ratiwal Customer Portal",
  description: "View and respond to support ticket messages.",
  robots: {
    index: false,
    follow: false,
  },
};

interface SupportDetailPageProps {
  params: Promise<{ requestId: string }>;
}

export default async function SupportDetailPage({ params }: SupportDetailPageProps) {
  const session = await getCustomerSession();
  if (!session) {
    redirect("/portal/login");
  }

  const { requestId } = await params;

  try {
    await PortalGuard.assertCustomerSupportAccess(session, requestId);
    await connectToDatabase();

    const ticket = await CustomerSupportRequest.findById(requestId).lean();
    if (!ticket) {
      notFound();
    }

    return (
      <div className="min-h-screen bg-radial from-[#0c2438] via-[#071a28] to-[#040e17] text-slate-100 flex flex-col pb-16 md:pb-0">
        <PortalHeader user={session.user} />
        <main className="flex-1">
          <Suspense fallback={<PortalCardSkeleton />}>
            <PortalSupportDetailView ticket={ticket} />
          </Suspense>
        </main>
        <PortalMobileNav />
      </div>
    );
  } catch {
    notFound();
  }
}
