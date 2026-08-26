export function PartnerOverviewSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-64 bg-slate-800 rounded"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-slate-900 border border-slate-800 rounded-xl p-4"></div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-96 bg-slate-900 border border-slate-800 rounded-xl"></div>
        <div className="h-96 bg-slate-900 border border-slate-800 rounded-xl"></div>
      </div>
    </div>
  );
}

export function PartnerTableSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-7 w-48 bg-slate-800 rounded"></div>
        <div className="h-9 w-32 bg-slate-800 rounded"></div>
      </div>
      <div className="h-80 bg-slate-900 border border-slate-800 rounded-xl"></div>
    </div>
  );
}
