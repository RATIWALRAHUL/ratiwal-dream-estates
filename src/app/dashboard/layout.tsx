import "server-only";
import Link from "next/link";
import { ShieldAlert, Lock, ArrowRight, ExternalLink } from "lucide-react";
import { getAdminSession } from "@/lib/auth/session";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const metadata = {
  title: "Admin Dashboard | Ratiwal Dream Estates",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  // 1. Unauthenticated State Guard
  if (!session) {
    return (
      <div className="min-h-screen bg-[#071a28] text-white flex flex-col items-center justify-center p-6 antialiased">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#0d2c42]/80 border border-[#0d2c42] shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#087fc3] to-[#0a6ba3] text-white flex items-center justify-center mx-auto shadow-lg shadow-[#087fc3]/30">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#42b7e8] block mb-1">
              Restricted Area
            </span>
            <h1 className="text-2xl font-bold font-serif text-white tracking-tight">
              Administrative Control Center
            </h1>
            <p className="text-xs text-[#cbd5e1] mt-2 leading-relaxed">
              Access to this dashboard is strictly restricted to authorized Ratiwal Dream Estates property analysts, editors, and administrative personnel.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#071a28]/60 border border-[#0d2c42] text-left space-y-2 text-xs">
            <div className="flex items-center gap-2 text-[#42b7e8] font-semibold">
              <ShieldAlert className="w-4 h-4" />
              <span>Authentication Required (401)</span>
            </div>
            <p className="text-[11px] text-[#647581] font-mono">
              A valid admin session token or authorization cookie is required.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white text-[#071a28] font-bold text-xs hover:bg-[#eaf5fa] transition-colors shadow-md"
            >
              <span>Return to Public Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Inactive Account Guard
  if (!session.user.isActive) {
    return (
      <div className="min-h-screen bg-[#071a28] text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#0d2c42] border border-[#0d2c42] text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold font-serif text-white">Account Inactive</h2>
          <p className="text-xs text-[#cbd5e1]">
            Your administrator account ({session.user.email}) has been deactivated or suspended. Please contact corporate management.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#42b7e8] hover:underline"
          >
            <span>Back to Home</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  // 3. Render Authenticated Dashboard Shell
  return <DashboardShell user={session.user}>{children}</DashboardShell>;
}
