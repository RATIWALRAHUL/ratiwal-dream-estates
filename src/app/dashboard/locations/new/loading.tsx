export default function NewLocationLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-pulse pb-12" aria-label="Loading new location form...">
      <div className="space-y-2">
        <div className="h-4 w-36 bg-slate-200 rounded" />
        <div className="h-8 w-64 bg-slate-200 rounded-lg" />
        <div className="h-3 w-96 bg-slate-200 rounded" />
      </div>

      <div className="p-8 rounded-3xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs space-y-6">
        <div className="h-6 w-48 bg-slate-200 rounded" />
        <div className="h-10 w-full bg-slate-100 rounded-xl" />
        <div className="h-10 w-full bg-slate-100 rounded-xl" />
        <div className="grid grid-cols-3 gap-4">
          <div className="h-10 bg-slate-100 rounded-xl" />
          <div className="h-10 bg-slate-100 rounded-xl" />
          <div className="h-10 bg-slate-100 rounded-xl" />
        </div>
        <div className="h-24 w-full bg-slate-100 rounded-xl" />
      </div>
    </div>
  );
}
