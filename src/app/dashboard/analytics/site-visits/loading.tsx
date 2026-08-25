export default function SiteVisitsAnalyticsLoading() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true">
      <div>
        <div className="h-3 w-36 bg-slate-200 rounded-full mb-3" />
        <div className="h-8 w-64 bg-slate-200 rounded-xl" />
        <div className="h-3 w-80 bg-slate-200 rounded-full mt-2" />
      </div>

      <div className="h-14 bg-white rounded-2xl border border-[rgba(7,26,40,0.08)]" />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] p-4" />
        ))}
      </div>
    </div>
  );
}
