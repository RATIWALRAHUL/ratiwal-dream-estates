import type { Metadata } from "next";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { CommunicationService } from "@/lib/services/communication.service";
import { CommunicationsMetrics } from "@/components/dashboard/communications/CommunicationsMetrics";
import { ArrowLeft, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Communication Delivery Health | Ratiwal Dream Estates Dashboard",
  description: "Transactional Email & WhatsApp delivery rates, bounce analytics, and operational health.",
};

export default async function CommunicationsAnalyticsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/dashboard/login");

  const metrics = await CommunicationService.getMetrics();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard/analytics"
            className="inline-flex items-center gap-1.5 text-xs text-[#647581] hover:text-[#071a28] transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Analytics Overview
          </Link>
          <h1 className="text-2xl font-bold font-serif text-[#071a28] tracking-tight">
            Transactional Delivery Health & Communications Analytics
          </h1>
          <p className="text-sm text-[#647581] mt-1">
            Delivery confirmation rates, bounce suppression tracking, and provider operational uptime.
          </p>
        </div>

        <Link
          href="/dashboard/communications"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#071a28] text-white hover:bg-[#087fc3] text-xs font-bold transition-all shadow-xs"
        >
          <span>Open Communications Hub</span>
          <ExternalLink className="w-3 h-3 text-[#42b7e8]" />
        </Link>
      </div>

      {/* KPI Metrics */}
      <CommunicationsMetrics metrics={metrics} />
    </div>
  );
}
