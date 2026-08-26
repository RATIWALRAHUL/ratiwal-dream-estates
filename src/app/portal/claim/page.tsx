import React, { Suspense } from "react";
import { PortalClaimForm } from "@/components/portal/PortalClaimForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Activate Customer Portal Account | Ratiwal Dream Estates",
  description: "Claim your private buyer portal invitation.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PortalClaimPage() {
  return (
    <div className="min-h-screen bg-radial from-[#0c2438] via-[#071a28] to-[#040e17] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <Suspense fallback={<div className="text-white text-sm">Loading invitation...</div>}>
        <PortalClaimForm />
      </Suspense>
    </div>
  );
}
