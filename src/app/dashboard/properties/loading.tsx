export default function PropertiesLoading() {
  return (
    <div className="space-y-6 animate-pulse" aria-label="Loading properties...">
      <div className="space-y-2">
        <div className="h-6 w-48 bg-slate-200 rounded-lg" />
        <div className="h-3.5 w-72 bg-slate-200 rounded-lg" />
      </div>

      <div className="p-5 rounded-2xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs space-y-4">
        <div className="h-10 w-full bg-slate-100 rounded-xl" />
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-8 bg-slate-100 rounded-xl" />
          ))}
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs space-y-3">
        <div className="h-48 bg-slate-100 rounded-xl" />
      </div>
    </div>
  );
}
