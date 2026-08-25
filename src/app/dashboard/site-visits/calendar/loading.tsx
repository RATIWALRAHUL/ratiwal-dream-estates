export default function SiteVisitCalendarLoading() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true">
      <div>
        <div className="h-3 w-36 bg-slate-200 rounded-full mb-3" />
        <div className="h-8 w-56 bg-slate-200 rounded-xl" />
        <div className="h-3 w-72 bg-slate-200 rounded-full mt-2" />
      </div>

      <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="h-8 w-40 bg-slate-200 rounded-xl" />
          <div className="h-8 w-32 bg-slate-200 rounded-xl" />
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-80 bg-slate-100 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
