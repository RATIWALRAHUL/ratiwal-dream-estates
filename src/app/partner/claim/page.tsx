import { Suspense } from "react";
import { PartnerClaimForm } from "@/components/partner/PartnerClaimForm";
import Link from "next/link";

export default function PartnerClaimPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-[#0d131f] border border-[#232f48] p-8 rounded-2xl shadow-2xl relative overflow-hidden">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center font-bold text-black text-xl shadow-lg shadow-amber-500/30 mx-auto mb-4">
            RD
          </div>
          <h2 className="text-2xl font-serif font-bold text-white tracking-wide">
            Claim Partner Invitation
          </h2>
          <p className="mt-2 text-xs text-slate-400">
            Enter your invitation token to activate your verified channel partner account and set up login credentials.
          </p>
        </div>

        <Suspense fallback={<div className="h-64 bg-slate-900 animate-pulse rounded-lg" />}>
          <PartnerClaimForm />
        </Suspense>

        <div className="text-center pt-4 border-t border-slate-800/80">
          <p className="text-xs text-slate-400">
            Already have an active account?{" "}
            <Link href="/partner/login" className="text-amber-400 hover:text-amber-300 font-medium hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
