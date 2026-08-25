export default function AvailabilityLoading() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true">
      <div>
        <div className="h-8 w-80 bg-slate-200 rounded-xl mb-2" />
        <div className="h-3 w-96 bg-slate-200 rounded-full" />
      </div>

      <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] p-5 space-y-3">
        <div className="h-4 w-48 bg-slate-200 rounded-lg mb-4" />
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-12 bg-slate-100 rounded-xl" />
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] p-5 space-y-3">
        <div className="h-4 w-48 bg-slate-200 rounded-lg mb-4" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 bg-slate-100 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
