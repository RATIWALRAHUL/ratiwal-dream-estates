export default function LocationIntelligenceLoading() {
  return (
    <div className="space-y-8 animate-pulse pb-16" aria-label="Loading intelligence hub...">
      <div className="p-8 rounded-3xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-4 w-48 bg-slate-200 rounded" />
          <div className="h-8 w-80 bg-slate-200 rounded-lg" />
        </div>
        <div className="h-10 w-28 bg-slate-200 rounded-xl" />
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="h-28 bg-white rounded-3xl border border-[rgba(7,26,40,0.08)]" />
        <div className="h-28 bg-white rounded-3xl border border-[rgba(7,26,40,0.08)]" />
        <div className="h-28 bg-white rounded-3xl border border-[rgba(7,26,40,0.08)]" />
        <div className="h-28 bg-white rounded-3xl border border-[rgba(7,26,40,0.08)]" />
      </div>

      <div className="h-72 bg-white rounded-3xl border border-[rgba(7,26,40,0.08)]" />
      <div className="h-64 bg-white rounded-3xl border border-[rgba(7,26,40,0.08)]" />
    </div>
  );
}
