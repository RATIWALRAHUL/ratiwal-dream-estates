import React from "react";
import { redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/auth/customer-session";
import { PortalQueryService } from "@/lib/services/portal-query.service";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { PortalMobileNav } from "@/components/portal/PortalMobileNav";
import { PortalSupportNewForm } from "@/components/portal/PortalSupportNewForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Open Support Ticket | Ratiwal Customer Portal",
  description: "Create a new customer inquiry or support request.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function NewSupportRequestPage() {
  const session = await getCustomerSession();
  if (!session) {
    redirect("/portal/login");
  }

  const data = await PortalQueryService.getPortalHomeData(session);

  return (
    <div className="min-h-screen bg-radial from-[#0c2438] via-[#071a28] to-[#040e17] text-slate-100 flex flex-col pb-16 md:pb-0">
      <PortalHeader user={session.user} />
      <main className="flex-1">
        <PortalSupportNewForm bookings={data.bookings} />
      </main>
      <PortalMobileNav />
    </div>
  );
}
