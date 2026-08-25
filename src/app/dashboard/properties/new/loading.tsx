export default function NewPropertyLoading() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-4 w-36 bg-slate-200 rounded" />
        <div className="h-6 w-64 bg-slate-200 rounded-lg" />
      </div>
      <div className="p-6 rounded-2xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs space-y-5">
        <div className="h-10 bg-slate-100 rounded-xl" />
        <div className="h-10 bg-slate-100 rounded-xl" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-10 bg-slate-100 rounded-xl" />
          <div className="h-10 bg-slate-100 rounded-xl" />
        </div>
        <div className="h-24 bg-slate-100 rounded-xl" />
      </div>
    </div>
  );
}
