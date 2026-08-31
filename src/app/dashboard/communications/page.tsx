import type { Metadata } from "next";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { CommunicationService } from "@/lib/services/communication.service";
import { CommunicationsMetrics } from "@/components/dashboard/communications/CommunicationsMetrics";
import { ListFilter, FileCode2, ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "Communications Hub | Ratiwal Dream Estates Dashboard",
  description: "Operational overview of transactional email, WhatsApp, and scheduled reminders.",
};

export default async function CommunicationsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/dashboard/login");

  const metrics = await CommunicationService.getMetrics();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#647581] mb-1">
            TRANSACTIONAL COMMUNICATIONS
          </p>
          <h1 className="text-2xl font-bold font-serif text-[#071a28] tracking-tight">
            Communications Hub & Automation
          </h1>
          <p className="text-sm text-[#647581] mt-1">
            Reliable transactional delivery tracking, WhatsApp template dispatch, and automated reminder schedules.
          </p>
        </div>

        {/* Action quick links */}
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/communications/deliveries"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[rgba(7,26,40,0.12)] text-[#071a28] hover:bg-white text-xs font-bold transition-colors shadow-xs"
          >
            <ListFilter className="w-4 h-4 text-[#087fc3]" />
            Delivery History
          </Link>
          <Link
            href="/dashboard/communications/templates"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[rgba(7,26,40,0.12)] text-[#071a28] hover:bg-white text-xs font-bold transition-colors shadow-xs"
          >
            <FileCode2 className="w-4 h-4 text-[#087fc3]" />
            Templates
          </Link>
          {metrics.deadLetterCount > 0 && (
            <Link
              href="/dashboard/communications/dead-letter"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-50 text-purple-800 border border-purple-200 text-xs font-bold transition-colors shadow-xs"
            >
              <ShieldAlert className="w-4 h-4 text-purple-700" />
              Dead-Letter ({metrics.deadLetterCount})
            </Link>
          )}
        </div>
      </div>

      {/* KPI Metrics */}
      <CommunicationsMetrics metrics={metrics} />

      {/* Architecture & Reliability Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Outbox Architecture */}
        <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-5 space-y-2.5">
          <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-[#647581]">
            Outbox Decoupling
          </h2>
          <p className="text-xs text-[#071a28] leading-relaxed">
            Business mutations (inquiries, lead updates, site visits) never wait on external network delivery. All events write to the durable database Outbox first.
          </p>
        </div>

        {/* Scheduled Lifecycle */}
        <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-5 space-y-2.5">
          <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-[#647581]">
            Automated Reminders
          </h2>
          <p className="text-xs text-[#071a28] leading-relaxed">
            Site visit confirmations automatically generate 24-hour and 2-hour reminders. Rescheduling or cancellation instantly cancels stale reminder events.
          </p>
        </div>

        {/* Privacy & Anti-Spam */}
        <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-5 space-y-2.5">
          <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-[#647581]">
            Consent & Suppression
          </h2>
          <p className="text-xs text-[#071a28] leading-relaxed">
            Strict transactional opt-in verification. Automatic suppression list updates on hard bounces, spam complaints, or user opt-outs.
          </p>
        </div>
      </div>
    </div>
  );
}
