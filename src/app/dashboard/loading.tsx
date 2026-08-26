import { LogoLoader } from "@/components/ui/LogoLoader";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 sm:space-y-8 animate-pulse">
      {/* Top Header Skeleton */}
      <div className="h-16 w-full rounded-2xl bg-white/60 border border-slate-200/60 flex items-center justify-between px-6">
        <div className="h-5 w-48 bg-slate-200 rounded-md" />
        <div className="h-8 w-24 bg-slate-200 rounded-lg" />
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-white border border-slate-200/60 p-5 space-y-3">
            <div className="h-4 w-28 bg-slate-200 rounded" />
            <div className="h-8 w-20 bg-slate-200 rounded" />
            <div className="h-3 w-36 bg-slate-100 rounded" />
          </div>
        ))}
      </div>

      {/* Center Table Skeleton with Branded Indicator */}
      <div className="h-64 rounded-2xl bg-white border border-slate-200/60 p-6 flex flex-col items-center justify-center">
        <LogoLoader variant="section" text="Preparing Real-Time Intelligence..." />
      </div>
    </div>
  );
}
