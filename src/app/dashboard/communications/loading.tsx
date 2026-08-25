export default function CommunicationsLoading() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true">
      <div>
        <div className="h-3 w-36 bg-slate-200 rounded-full mb-3" />
        <div className="h-8 w-72 bg-slate-200 rounded-xl" />
        <div className="h-3 w-96 bg-slate-200 rounded-full mt-2" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] p-4 space-y-2">
            <div className="flex justify-between">
              <div className="h-2 w-16 bg-slate-200 rounded-full" />
              <div className="w-7 h-7 bg-slate-200 rounded-xl" />
            </div>
            <div className="h-7 w-12 bg-slate-200 rounded-lg" />
            <div className="h-2 w-20 bg-slate-200 rounded-full" />
          </div>
        ))}
      </div>

      <div className="h-16 bg-white rounded-2xl border border-[rgba(7,26,40,0.08)]" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] p-5 space-y-3">
            <div className="h-3 w-28 bg-slate-200 rounded-full" />
            <div className="h-12 bg-slate-100 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
