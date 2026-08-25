export default function DashboardLoading() {
  return (
    <div className="space-y-6 sm:space-y-8 animate-pulse pb-10" aria-label="Loading Control Center intelligence...">
      {/* 1. MarketPulseStrip Skeleton */}
      <div className="h-40 rounded-3xl bg-[#071a28]/10 border border-[rgba(7,26,40,0.08)]" />

      {/* 2. 6 KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="p-6 rounded-3xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1.5">
                <div className="h-3 w-24 bg-slate-200 rounded" />
                <div className="h-4 w-16 bg-slate-100 rounded-full" />
              </div>
              <div className="w-10 h-10 rounded-2xl bg-slate-200" />
            </div>
            <div className="flex justify-between items-end">
              <div className="h-9 w-20 bg-slate-200 rounded-lg" />
              <div className="h-7 w-16 bg-slate-100 rounded" />
            </div>
            <div className="pt-3 border-t border-slate-100 h-3 w-36 bg-slate-200 rounded" />
          </div>
        ))}
      </div>

      {/* 3. Inventory Status Bar Skeleton */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs space-y-5">
        <div className="flex justify-between items-center">
          <div className="h-5 w-56 bg-slate-200 rounded-lg" />
          <div className="h-7 w-32 bg-slate-200 rounded-full" />
        </div>
        <div className="h-4 w-full bg-slate-100 rounded-full" />
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-slate-100/70 rounded-2xl" />
          ))}
        </div>
      </div>

      {/* 4. Diligence Compliance Alert Skeleton */}
      <div className="h-24 rounded-3xl bg-emerald-50/50 border border-emerald-100" />

      {/* 5. Recent Properties Table Skeleton */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs space-y-4">
        <div className="h-5 w-64 bg-slate-200 rounded-lg" />
        <div className="h-48 bg-slate-50 rounded-2xl border border-slate-100" />
      </div>

      {/* 6. Growth Corridor Coverage Grid Skeleton */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs space-y-4">
        <div className="h-5 w-64 bg-slate-200 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-36 bg-slate-50 rounded-2xl border border-slate-100" />
          ))}
        </div>
      </div>
    </div>
  );
}
