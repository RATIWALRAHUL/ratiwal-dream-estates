export default function DeadLetterLoading() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true">
      <div>
        <div className="h-3 w-36 bg-slate-200 rounded-full mb-3" />
        <div className="h-8 w-64 bg-slate-200 rounded-xl" />
        <div className="h-3 w-80 bg-slate-200 rounded-full mt-2" />
      </div>

      <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] overflow-hidden">
        <div className="p-4 bg-[#f8f7f4] border-b border-[rgba(7,26,40,0.06)] grid grid-cols-7 gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-2 bg-slate-200 rounded-full" />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 border-b border-[rgba(7,26,40,0.04)] grid grid-cols-7 gap-4">
            {Array.from({ length: 7 }).map((_, j) => (
              <div key={j} className="h-3 bg-slate-100 rounded-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
