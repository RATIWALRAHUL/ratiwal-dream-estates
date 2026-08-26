import { redirect } from "next/navigation";
import Image from "next/image";
import { getPartnerSession } from "@/lib/auth/partner-session";
import { PartnerLoginForm } from "@/components/partner/PartnerLoginForm";
import Link from "next/link";

export default async function PartnerLoginPage() {
  const session = await getPartnerSession();
  if (session) {
    redirect("/partner");
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-[#0d131f] border border-[#232f48] p-8 rounded-2xl shadow-2xl relative overflow-hidden">
        {/* Decorative ambient glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="text-center">
          <Link href="/" className="inline-block mx-auto mb-4 group" aria-label="Ratiwal Dream Estates Home">
            <Image
              src="/images/brand/ratiwal-logo-white.svg"
              alt="Ratiwal Dream Estates"
              width={220}
              height={80}
              priority
              className="h-10 sm:h-11 w-auto max-w-[200px] object-contain mx-auto transition-transform duration-200 group-hover:scale-[1.02]"
            />
          </Link>
          <h2 className="text-2xl font-serif font-bold text-white tracking-wide">
            Channel Partner Portal
          </h2>
          <p className="mt-2 text-xs text-slate-400">
            Sign in to register buyers, track verified commissions, and access exclusive inventory collateral.
          </p>
        </div>

        <PartnerLoginForm />

        <div className="text-center pt-4 border-t border-slate-800/80">
          <p className="text-xs text-slate-400">
            Received an onboarding invite?{" "}
            <Link href="/partner/claim" className="text-amber-400 hover:text-amber-300 font-medium hover:underline">
              Claim Invitation
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
