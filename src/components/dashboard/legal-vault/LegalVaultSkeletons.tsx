export function LegalVaultOverviewSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true">
      <div className="flex justify-between items-center">
        <div>
          <div className="h-3 w-36 bg-slate-200 rounded-full mb-3" />
          <div className="h-8 w-64 bg-slate-200 rounded-xl" />
        </div>
        <div className="h-10 w-36 bg-slate-200 rounded-xl" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] p-5" />
        ))}
      </div>

      <div className="h-14 bg-white rounded-2xl border border-[rgba(7,26,40,0.08)]" />
      <div className="h-96 bg-white rounded-2xl border border-[rgba(7,26,40,0.08)]" />
    </div>
  );
}

export function LegalDocumentDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse max-w-5xl" aria-busy="true">
      <div className="h-8 w-72 bg-slate-200 rounded-xl" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-96 bg-white rounded-2xl border border-[rgba(7,26,40,0.08)]" />
        <div className="h-96 bg-white rounded-2xl border border-[rgba(7,26,40,0.08)]" />
      </div>
    </div>
  );
}
