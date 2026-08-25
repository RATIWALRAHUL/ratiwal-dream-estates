export default function PreviewLocationLoading() {
  return (
    <div className="space-y-8 animate-pulse pb-16" aria-label="Loading preview...">
      <div className="h-16 rounded-2xl bg-amber-200/50" />
      <div className="h-96 rounded-3xl bg-[#071a28]/10" />
      <div className="h-48 rounded-3xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs" />
      <div className="grid grid-cols-3 gap-4">
        <div className="h-36 bg-white rounded-2xl border border-[rgba(7,26,40,0.08)]" />
        <div className="h-36 bg-white rounded-2xl border border-[rgba(7,26,40,0.08)]" />
        <div className="h-36 bg-white rounded-2xl border border-[rgba(7,26,40,0.08)]" />
      </div>
    </div>
  );
}
