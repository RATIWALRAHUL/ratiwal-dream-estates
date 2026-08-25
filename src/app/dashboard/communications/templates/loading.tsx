export default function TemplatesLoading() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true">
      <div>
        <div className="h-3 w-36 bg-slate-200 rounded-full mb-3" />
        <div className="h-8 w-64 bg-slate-200 rounded-xl" />
        <div className="h-3 w-80 bg-slate-200 rounded-full mt-2" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] p-3" />
          ))}
        </div>
        <div className="lg:col-span-2 h-96 bg-white rounded-2xl border border-[rgba(7,26,40,0.08)]" />
      </div>
    </div>
  );
}
