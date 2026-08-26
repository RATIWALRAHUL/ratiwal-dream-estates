import React, { Suspense } from "react";
import { PortalLoginForm } from "@/components/portal/PortalLoginForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Customer Sign In | Ratiwal Dream Estates Portal",
  description: "Sign in to access your luxury property bookings, payment plans, and documents.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PortalLoginPage() {
  return (
    <div className="min-h-screen bg-radial from-[#0c2438] via-[#071a28] to-[#040e17] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <Suspense fallback={<div className="text-white text-sm">Loading sign in...</div>}>
        <PortalLoginForm />
      </Suspense>
    </div>
  );
}
