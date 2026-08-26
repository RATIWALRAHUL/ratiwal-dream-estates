import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/auth/customer-session";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { PortalMobileNav } from "@/components/portal/PortalMobileNav";
import { PortalPrivacyView } from "@/components/portal/PortalPrivacyView";
import { PortalHomeSkeleton } from "@/components/portal/PortalSkeletons";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Privacy & DPDP Rights | Ratiwal Customer Portal",
  description: "Manage statutory privacy rights, data access, and consent categories.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function PortalPrivacyPage() {
  const session = await getCustomerSession();
  if (!session) {
    redirect("/portal/login");
  }

  return (
    <div className="min-h-screen bg-radial from-[#0c2438] via-[#071a28] to-[#040e17] text-slate-100 flex flex-col pb-16 md:pb-0">
      <PortalHeader user={session.user} />
      <main className="flex-1">
        <Suspense fallback={<PortalHomeSkeleton />}>
          <PortalPrivacyView />
        </Suspense>
      </main>
      <PortalMobileNav />
    </div>
  );
}
