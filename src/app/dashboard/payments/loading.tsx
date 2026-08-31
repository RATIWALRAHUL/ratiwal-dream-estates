export default function PaymentsLoading() {
  return (
    <div className="space-y-6 animate-pulse" aria-label="Loading Payments & Ledger...">
      <div className="space-y-2">
        <div className="h-6 w-60 bg-slate-200 rounded-lg" />
        <div className="h-3.5 w-88 bg-slate-200 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-5 rounded-2xl bg-white border border-[rgba(7,26,40,0.08)] space-y-2">
            <div className="h-4 w-28 bg-slate-100 rounded-md" />
            <div className="h-8 w-24 bg-slate-200 rounded-lg" />
          </div>
        ))}
      </div>

      <div className="p-6 rounded-2xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs space-y-4">
        <div className="h-10 w-full bg-slate-100 rounded-xl" />
        <div className="h-72 bg-slate-100 rounded-xl" />
      </div>
    </div>
  );
}
