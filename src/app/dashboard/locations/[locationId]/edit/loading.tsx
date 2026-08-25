export default function EditLocationLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-pulse pb-16" aria-label="Loading location editor...">
      <div className="p-6 rounded-3xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-4 w-48 bg-slate-200 rounded" />
          <div className="h-8 w-72 bg-slate-200 rounded-lg" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-24 bg-slate-200 rounded-xl" />
          <div className="h-9 w-32 bg-slate-200 rounded-xl" />
        </div>
      </div>

      <div className="flex gap-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-9 w-28 bg-slate-200 rounded-xl" />
        ))}
      </div>

      <div className="p-8 rounded-3xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs space-y-6">
        <div className="h-6 w-56 bg-slate-200 rounded" />
        <div className="grid grid-cols-2 gap-6">
          <div className="h-10 bg-slate-100 rounded-xl" />
          <div className="h-10 bg-slate-100 rounded-xl" />
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div className="h-10 bg-slate-100 rounded-xl" />
          <div className="h-10 bg-slate-100 rounded-xl" />
          <div className="h-10 bg-slate-100 rounded-xl" />
          <div className="h-10 bg-slate-100 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
