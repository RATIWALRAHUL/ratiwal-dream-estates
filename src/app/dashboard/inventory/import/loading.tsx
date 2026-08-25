export default function ImportLoading() {
  return (
    <div className="space-y-6 animate-pulse max-w-4xl" aria-busy="true">
      <div className="h-8 w-64 bg-slate-200 rounded-xl" />
      <div className="h-96 bg-white rounded-2xl border border-[rgba(7,26,40,0.08)]" />
    </div>
  );
}
