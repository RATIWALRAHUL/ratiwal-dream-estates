import type { Metadata } from "next";
import { getPartnerSession } from "@/lib/auth/partner-session";
import { PartnerHeader } from "@/components/partner/PartnerHeader";

export const metadata: Metadata = {
  title: "Channel Partner Portal | Ratiwal Dream Estates",
  description: "Exclusive broker & channel partner portal for high-value plotted land inventory, lead attribution, and commission management.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getPartnerSession();

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-black">
      {session && <PartnerHeader user={session.user} />}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="border-t border-slate-900 bg-[#04060a] py-6 text-center text-xs text-slate-500">
        <p>© 2026 Ratiwal Dream Estates. Authorized Partner & Broker Network. Strictly Confidential.</p>
      </footer>
    </div>
  );
}
