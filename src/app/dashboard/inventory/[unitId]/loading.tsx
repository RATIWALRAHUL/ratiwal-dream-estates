export default function UnitDetailLoading() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true">
      <div className="flex justify-between items-center">
        <div className="h-8 w-64 bg-slate-200 rounded-xl" />
        <div className="h-10 w-32 bg-slate-200 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-96 bg-white rounded-2xl border border-[rgba(7,26,40,0.08)]" />
        <div className="h-96 bg-white rounded-2xl border border-[rgba(7,26,40,0.08)]" />
      </div>
    </div>
  );
}
