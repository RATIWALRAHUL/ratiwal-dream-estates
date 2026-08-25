export default function EditPropertyLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between pb-4 border-b border-[rgba(7,26,40,0.06)]">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-slate-200 rounded" />
          <div className="h-6 w-64 bg-slate-200 rounded-lg" />
        </div>
        <div className="h-9 w-28 bg-slate-200 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="hidden lg:block lg:col-span-3">
          <div className="h-64 bg-slate-100 rounded-2xl" />
        </div>
        <div className="lg:col-span-9 space-y-6">
          <div className="h-96 bg-slate-100 rounded-2xl" />
          <div className="h-48 bg-slate-100 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
