export default function LeadsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Page header */}
      <div>
        <div className="h-3 w-48 bg-slate-200 rounded-full mb-3" />
        <div className="h-8 w-72 bg-slate-200 rounded-xl" />
        <div className="h-3 w-56 bg-slate-200 rounded-full mt-2" />
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-2 w-16 bg-slate-200 rounded-full" />
              <div className="w-8 h-8 bg-slate-200 rounded-xl" />
            </div>
            <div className="h-8 w-12 bg-slate-200 rounded-lg" />
            <div className="h-2 w-24 bg-slate-200 rounded-full" />
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] p-4">
        <div className="h-3 w-20 bg-slate-200 rounded-full mb-3" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`h-9 bg-slate-200 rounded-xl ${i === 0 ? "lg:col-span-2" : ""}`} />
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] overflow-hidden">
        <div className="p-4 bg-[#f8f7f4] border-b border-[rgba(7,26,40,0.06)] grid grid-cols-10 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-2 bg-slate-200 rounded-full" />
          ))}
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="px-4 py-3 border-b border-[rgba(7,26,40,0.04)] grid grid-cols-10 gap-4">
            {Array.from({ length: 10 }).map((_, j) => (
              <div key={j} className="h-3 bg-slate-100 rounded-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
