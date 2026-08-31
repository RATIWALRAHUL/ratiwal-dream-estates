import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";

interface MarketPulseStripProps {
  metrics: {
    totalProperties: number;
    publishedProperties: number;
    availablePlots: number;
    reservedPlots: number;
    activeLocations: number;
  };
}

export function MarketPulseStrip({ metrics }: MarketPulseStripProps) {
  return (
    <div className="relative overflow-hidden p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#071a28] via-[#0b2a40] to-[#087fc3]/90 text-white shadow-[0_12px_36px_rgba(7,26,40,0.12)] border border-[#0d2c42]">
      {/* Background ambient radial glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-[#42b7e8]/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-12 w-48 h-48 rounded-full bg-[#087fc3]/20 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Left: Intelligence Title & Status */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#42b7e8] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#42b7e8]" />
            </span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#42b7e8]">
              Portfolio Intelligence & Market Pulse
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-normal font-serif text-white tracking-tight">
            Control Center Active & Synchronized
          </h2>

          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Real-time administrative governance across <span className="font-semibold text-white">{metrics.activeLocations} Growth Corridors</span>. <span className="text-[#42b7e8] font-semibold">{metrics.availablePlots} plots available</span> ready for investor allotment with 100% verified legal diligence.
          </p>
        </div>

        {/* Right: Quick Action Buttons & Insights */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            href="/dashboard/properties/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#42b7e8] text-[#071a28] text-xs font-bold hover:bg-[#bfe6f6] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_4px_16px_rgba(66,183,232,0.3)]"
          >
            <Plus className="w-4 h-4" />
            <span>Create Listing</span>
          </Link>

          <Link
            href="/dashboard/properties"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 text-xs font-semibold text-white transition-all hover:border-white/25"
          >
            <span>Manage Catalog</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#42b7e8]" />
          </Link>
        </div>
      </div>
    </div>
  );
}
