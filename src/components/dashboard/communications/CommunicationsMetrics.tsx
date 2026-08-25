import { Send, CheckCircle2, Clock, AlertTriangle, ShieldAlert, Radio, Mail, MessageSquare } from "lucide-react";
import type { CommunicationsMetrics as MetricsType } from "@/types/communication";

interface CommunicationsMetricsProps {
  metrics: MetricsType;
}

export function CommunicationsMetrics({ metrics }: CommunicationsMetricsProps) {
  return (
    <div className="space-y-4">
      {/* 6 Primary KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Pending */}
        <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-4 flex flex-col justify-between hover:border-[#087fc3]/30 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#647581] font-bold">
              Pending
            </span>
            <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold font-serif text-[#071a28]">
              {metrics.pendingCount.toLocaleString("en-IN")}
            </p>
            <p className="text-[10px] text-[#647581] mt-0.5">Due for dispatch</p>
          </div>
        </div>

        {/* Scheduled */}
        <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-4 flex flex-col justify-between hover:border-[#087fc3]/30 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#647581] font-bold">
              Scheduled
            </span>
            <div className="w-7 h-7 rounded-xl bg-[#087fc3]/10 text-[#087fc3] flex items-center justify-center">
              <Send className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold font-serif text-[#071a28]">
              {metrics.scheduledCount.toLocaleString("en-IN")}
            </p>
            <p className="text-[10px] text-[#647581] mt-0.5">24h / 2h reminders</p>
          </div>
        </div>

        {/* Delivered / Sent */}
        <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-4 flex flex-col justify-between hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-700 font-bold">
              Delivered
            </span>
            <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold font-serif text-emerald-800">
              {metrics.deliveredCount.toLocaleString("en-IN")}
            </p>
            <p className="text-[10px] text-emerald-700 mt-0.5">
              {metrics.deliveryRatePercent}% success rate
            </p>
          </div>
        </div>

        {/* Failed */}
        <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-4 flex flex-col justify-between hover:border-rose-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-rose-600 font-bold">
              Failed
            </span>
            <div className="w-7 h-7 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold font-serif text-rose-700">
              {metrics.failedCount.toLocaleString("en-IN")}
            </p>
            <p className="text-[10px] text-rose-600 mt-0.5">Provider errors</p>
          </div>
        </div>

        {/* Dead-Letter */}
        <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-4 flex flex-col justify-between hover:border-purple-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-purple-700 font-bold">
              Dead-Letter
            </span>
            <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold font-serif text-purple-800">
              {metrics.deadLetterCount.toLocaleString("en-IN")}
            </p>
            <p className="text-[10px] text-purple-700 mt-0.5">Exceeded retries</p>
          </div>
        </div>

        {/* Suppressed */}
        <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-4 flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#647581] font-bold">
              Suppressed
            </span>
            <div className="w-7 h-7 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <Radio className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold font-serif text-[#071a28]">
              {metrics.suppressedCount.toLocaleString("en-IN")}
            </p>
            <p className="text-[10px] text-[#647581] mt-0.5">Bounces & opt-outs</p>
          </div>
        </div>
      </div>

      {/* Operational Provider & Health Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[rgba(7,26,40,0.08)] flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#087fc3]" />
            <span className="font-semibold text-[#071a28]">Email (Resend):</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
              metrics.providerStatus.email === "LIVE"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-amber-50 text-amber-700 border border-amber-200"
            }`}>
              {metrics.providerStatus.email}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#24D17F]" />
            <span className="font-semibold text-[#071a28]">WhatsApp (Meta Cloud):</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
              metrics.providerStatus.whatsapp === "LIVE"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-amber-50 text-amber-700 border border-amber-200"
            }`}>
              {metrics.providerStatus.whatsapp}
            </span>
          </div>
        </div>

        <div className="text-[11px] text-[#647581] font-mono">
          {metrics.oldestPendingMinutes !== undefined && metrics.oldestPendingMinutes > 0 && (
            <span className="text-amber-700 font-bold mr-3">
              Oldest pending: {metrics.oldestPendingMinutes}m ago
            </span>
          )}
          <span>Last sync: {new Date(metrics.lastWorkerRunAt || Date.now()).toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
}
